import { Router } from 'express';
import { register, login, getMe, verifyEmail, verifyPhone, resendOTP } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/verify-phone', verifyPhone);
router.post('/resend-otp', resendOTP);
router.get('/me', authenticate, getMe);

export default router;

