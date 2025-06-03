import { Router } from 'express';

import { callback, requestTransaction, verify } from '../controllers/transaction.controller';

const router = Router();

router.post('/create', requestTransaction);
router.post('/verify', verify);
router.post('/callback', callback);
export default router;
