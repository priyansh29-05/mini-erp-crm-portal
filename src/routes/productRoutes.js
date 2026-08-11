const express = require('express');
const { createProduct, updateProduct } = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// All product routes require authentication
router.use(authenticate);

router.post('/', createProduct);
router.put('/:id', updateProduct);

module.exports = router;
