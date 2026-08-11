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
