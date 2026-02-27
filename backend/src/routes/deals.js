import express from 'express';
import { getDealSummary } from '../controllers/dealController.js';

const router = express.Router();

router.get('/summary', getDealSummary);

export default router;
