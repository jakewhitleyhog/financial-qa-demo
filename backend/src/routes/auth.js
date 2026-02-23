import { Router } from 'express';
import { requestMagicLink, verifyMagicLink, getMe, logout, demoLogin } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', requestMagicLink);
router.post('/verify', verifyMagicLink);
router.post('/demo', demoLogin);
router.get('/me', requireAuth, getMe);
router.post('/logout', logout);

export default router;
