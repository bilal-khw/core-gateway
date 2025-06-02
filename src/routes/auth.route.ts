import { Router } from 'express';
import {
    signup,
    login,
    verifyOtp,
    refreshToken,
} from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/refresh-token', refreshToken);

export default router;
