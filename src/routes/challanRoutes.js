const express = require('express');
const challanController = require('../controllers/challanController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// All challan routes require authentication
router.use(authenticate);

router.post('/', challanController.createChallan);
router.get('/', challanController.getChallans);
router.get('/:id', challanController.getChallanById);
router.post('/:id/confirm', challanController.confirmChallan);
router.post('/:id/cancel', challanController.cancelChallan);

module.exports = router;
