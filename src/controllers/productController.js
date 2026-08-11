const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createProduct = async (req, res) => {
  try {
    const { name, sku, category, unitPrice, currentStock, minStockAlert, location } = req.body;

    // Validate required fields
    if (!name || !sku || !category || unitPrice === undefined || currentStock === undefined || minStockAlert === undefined || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate non-negative numbers
    if (unitPrice < 0 || currentStock < 0 || minStockAlert < 0) {
      return res.status(400).json({ error: 'unitPrice, currentStock, and minStockAlert must be non-negative numbers' });
    }

    // Check for duplicate SKU
    const existingProduct = await prisma.product.findUnique({ where: { sku } });
    if (existingProduct) {
      return res.status(409).json({ error: 'Product with this SKU already exists' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        unitPrice,
        currentStock,
        minStockAlert,
        location
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error while creating product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStock, ...updateData } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Prevent negative unitPrice or minStockAlert if they are being updated
    if (updateData.unitPrice !== undefined && updateData.unitPrice < 0) {
      return res.status(400).json({ error: 'unitPrice must be a non-negative number' });
    }
    if (updateData.minStockAlert !== undefined && updateData.minStockAlert < 0) {
      return res.status(400).json({ error: 'minStockAlert must be a non-negative number' });
    }
    
    // Check if updating SKU to an existing one
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const duplicateSku = await prisma.product.findUnique({ where: { sku: updateData.sku } });
      if (duplicateSku) {
         return res.status(409).json({ error: 'Product with this SKU already exists' });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });

    if (currentStock !== undefined) {
      return res.status(200).json({
        ...updatedProduct,
        warning: 'Stock changes must go through /products/:id/stock-movement. The provided currentStock was ignored.'
      });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error while updating product' });
  }
};

exports.listProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const category = req.query.category;
    const lowStock = req.query.lowStock === 'true';

    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category) {
      where.category = category;
    }

    const [allProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    let data = allProducts;
    
    if (lowStock) {
      data = data.filter(p => p.currentStock <= p.minStockAlert);
    }

    // Paginate manually after filter if lowStock is applied, otherwise we could just query DB
    // However, Prisma doesn't directly support comparing two columns in `where` easily without raw query,
    // so filtering in JS is okay for this mini-erp. Let's adjust total if we filtered in JS.
    if (lowStock) {
      // re-calculate pagination after manual JS filter
      const paginatedData = data.slice(skip, skip + limit).map(p => ({
        ...p,
        isLowStock: true
      }));
      return res.status(200).json({ data: paginatedData, total: data.length, page, limit });
    }

    // Apply isLowStock map for normal flow
    const paginatedData = data.slice(skip, skip + limit).map(p => ({
      ...p,
      isLowStock: p.currentStock <= p.minStockAlert
    }));

    res.status(200).json({ data: paginatedData, total, page, limit });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ error: 'Internal server error while listing products' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({
      ...product,
      isLowStock: product.currentStock <= product.minStockAlert
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error while fetching product' });
  }
};

exports.recordStockMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChanged, movementType, reason } = req.body;

    if (quantityChanged === undefined || quantityChanged <= 0 || typeof quantityChanged !== 'number') {
      return res.status(400).json({ error: 'quantityChanged must be a positive number' });
    }
    if (movementType !== 'IN' && movementType !== 'OUT') {
      return res.status(400).json({ error: 'movementType must be exactly IN or OUT' });
    }
    if (!reason || typeof reason !== 'string') {
      return res.status(400).json({ error: 'reason must be a non-empty string' });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (movementType === 'OUT' && product.currentStock < quantityChanged) {
      return res.status(400).json({ error: 'Not enough stock for this OUT movement' });
    }

    const newStock = movementType === 'IN' 
      ? product.currentStock + quantityChanged
      : product.currentStock - quantityChanged;

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: { currentStock: newStock }
      });

      const stockMovement = await tx.stockMovement.create({
        data: {
          productId: id,
          quantityChanged,
          movementType,
          reason,
          createdBy: req.user.userId
        }
      });

      return { updatedProduct, stockMovement };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Record stock movement error:', error);
    res.status(500).json({ error: 'Internal server error while recording stock movement' });
  }
};

exports.listStockMovements = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const skip = (page - 1) * limit;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where: { productId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where: { productId: id } })
    ]);

    res.status(200).json({ data, total, page, limit });
  } catch (error) {
    console.error('List stock movements error:', error);
    res.status(500).json({ error: 'Internal server error while listing stock movements' });
  }
};
