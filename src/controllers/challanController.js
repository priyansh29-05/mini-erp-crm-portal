const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createChallan = async (req, res) => {
  try {
    const { customerId, items } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'customerId and non-empty items array are required' });
    }

    // 1. Validate customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // 2. Validate all products and gather data for snapshot
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const foundProductIds = products.map(p => p.id);
    const missingProductIds = productIds.filter(id => !foundProductIds.includes(id));

    if (missingProductIds.length > 0) {
      return res.status(404).json({ error: `Following products were not found: ${missingProductIds.join(', ')}` });
    }

    // 3. Prepare challan items and calculate total quantity
    let totalQuantity = 0;
    const challanItemsData = [];

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ error: `Quantity must be a positive integer for product ${item.productId}` });
      }

      const product = products.find(p => p.id === item.productId);
      
      totalQuantity += item.quantity;
      
      challanItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        productNameSnapshot: product.name,
        unitPriceSnapshot: product.unitPrice
      });
    }

    // 4. Generate challanNumber
    // Note: Simple max-query incrementing is used. Under high concurrency, 
    // a theoretical race condition could exist. A production system would use 
    // a database sequence, but this approach is acceptable here.
    const lastChallan = await prisma.challan.findFirst({
      orderBy: { challanNumber: 'desc' }
    });

    let nextNumber = 1;
    if (lastChallan && lastChallan.challanNumber.startsWith('CHL-')) {
      const parts = lastChallan.challanNumber.split('-');
      if (parts.length === 2 && !isNaN(parts[1])) {
        nextNumber = parseInt(parts[1], 10) + 1;
      }
    }
    const challanNumber = `CHL-${String(nextNumber).padStart(4, '0')}`;

    // 5. Create challan
    const newChallan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity,
        status: 'DRAFT',
        createdBy: req.user.userId,
        challanItems: {
          create: challanItemsData
        }
      },
      include: {
        challanItems: true
      }
    });

    res.status(201).json(newChallan);
  } catch (error) {
    console.error('Error creating challan:', error);
    res.status(500).json({ error: 'Internal server error while creating challan' });
  }
};

exports.getChallans = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customerId } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (customerId) {
      where.customerId = customerId;
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.challan.count({ where })
    ]);

    res.status(200).json({
      data: challans,
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    console.error('Error fetching challans:', error);
    res.status(500).json({ error: 'Internal server error while fetching challans' });
  }
};

exports.getChallanById = async (req, res) => {
  try {
    const { id } = req.params;

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        challanItems: true
      }
    });

    if (!challan) {
      return res.status(404).json({ error: 'Challan not found' });
    }

    res.status(200).json(challan);
  } catch (error) {
    console.error('Error fetching challan:', error);
    res.status(500).json({ error: 'Internal server error while fetching challan' });
  }
};
