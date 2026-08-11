const express = require('express');
const { createCustomer } = require('../controllers/customerController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Apply authenticate middleware to all customer routes
router.use(authenticate);

router.post('/', createCustomer);

module.exports = router;
