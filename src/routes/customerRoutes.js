const express = require('express');
const { createCustomer, updateCustomer } = require('../controllers/customerController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Apply authenticate middleware to all customer routes
router.use(authenticate);

router.post('/', createCustomer);
router.put('/:id', updateCustomer);

module.exports = router;
