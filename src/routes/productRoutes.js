const express = require('express');
const { createProduct, updateProduct, listProducts, getProduct, recordStockMovement, listStockMovements } = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// All product routes require authentication
router.use(authenticate);

router.post('/', createProduct);
router.get('/', listProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.post('/:id/stock-movement', recordStockMovement);
router.get('/:id/stock-movements', listStockMovements);

module.exports = router;
