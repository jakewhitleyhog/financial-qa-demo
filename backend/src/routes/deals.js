import express from 'express';
import { getDealSummary } from '../controllers/dealController.js';
import { getOilPrice } from '../controllers/oilPriceController.js';

const router = express.Router();

router.get('/summary', getDealSummary);
router.get('/oil-price', getOilPrice);

export default router;
