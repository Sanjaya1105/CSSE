const express = require('express');
const {
  createCardPayment,
  createGovernmentPayment,
  createInsurancePayment,
} = require('../controllers/paymentController');

const router = express.Router();

router.post('/card', createCardPayment);
router.post('/government', createGovernmentPayment);
router.post('/insurance', createInsurancePayment);

module.exports = router;