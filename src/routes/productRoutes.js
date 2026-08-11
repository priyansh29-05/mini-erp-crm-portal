const express = require('express');
const { createProduct, updateProduct, listProducts, getProduct } = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// All product routes require authentication
router.use(authenticate);

router.post('/', createProduct);
router.get('/', listProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);

module.exports = router;
