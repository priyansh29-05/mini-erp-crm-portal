const express = require('express');
const { createCustomer, updateCustomer, listCustomers, getCustomer, addNote } = require('../controllers/customerController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Apply authenticate middleware to all customer routes
router.use(authenticate);

router.post('/', createCustomer);
router.get('/', listCustomers);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);
router.post('/:id/notes', addNote);

module.exports = router;
