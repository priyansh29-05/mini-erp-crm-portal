const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const validateCustomerData = (data) => {
  const { name, mobile, customerType, address, status } = data;
  
  if (!name || typeof name !== 'string') return 'Name is required and must be a string';
  if (!mobile || typeof mobile !== 'string') return 'Mobile is required and must be a string';
  if (!address || typeof address !== 'string') return 'Address is required and must be a string';
  
  const validTypes = ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'];
  if (!customerType || !validTypes.includes(customerType)) {
    return `CustomerType is required and must be one of: ${validTypes.join(', ')}`;
  }
  
  const validStatuses = ['LEAD', 'ACTIVE', 'INACTIVE'];
  if (!status || !validStatuses.includes(status)) {
    return `Status is required and must be one of: ${validStatuses.join(', ')}`;
  }

  return null;
};

exports.createCustomer = async (req, res) => {
  try {
    const errorMsg = validateCustomerData(req.body);
    if (errorMsg) {
      return res.status(400).json({ error: errorMsg });
    }

    const {
      name, mobile, customerType, address, status,
      email, businessName, gstNumber, followUpDate, notes
    } = req.body;

    const customer = await prisma.customer.create({
      data: {
        name, mobile, customerType, address, status,
        email, businessName, gstNumber,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error while creating customer' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const errorMsg = validateCustomerData(req.body);
    if (errorMsg) {
      return res.status(400).json({ error: errorMsg });
    }

    const {
      name, mobile, customerType, address, status,
      email, businessName, gstNumber, followUpDate, notes
    } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name, mobile, customerType, address, status,
        email, businessName, gstNumber,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes
      }
    });

    res.status(200).json(customer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error while updating customer' });
  }
};

exports.listCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status;
    const customerType = req.query.customerType;

    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) where.status = status;
    if (customerType) where.customerType = customerType;

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.status(200).json({ data, total, page, limit });
  } catch (error) {
    console.error('List customers error:', error);
    res.status(500).json({ error: 'Internal server error while listing customers' });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Internal server error while fetching customer' });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || typeof note !== 'string') {
      return res.status(400).json({ error: 'Note is required and must be a string' });
    }

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' '); // format: YYYY-MM-DD HH:mm
    const formattedNote = `[${timestamp}] ${note}\n`;
    
    const newNotes = customer.notes 
      ? formattedNote + customer.notes 
      : formattedNote;

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: { notes: newNotes }
    });

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Internal server error while adding note' });
  }
};
