const express = require('express');
const { createCustomer, updateCustomer, listCustomers } = require('../controllers/customerController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Apply authenticate middleware to all customer routes
router.use(authenticate);

router.post('/', createCustomer);
router.get('/', listCustomers);
router.put('/:id', updateCustomer);

module.exports = router;
