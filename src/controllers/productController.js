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
