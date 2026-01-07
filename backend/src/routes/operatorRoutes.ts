import { Router } from 'express';
import {
  registerOperator,
  getOperators,
  getOperatorById,
  updateOperator,
  blacklistOperator,
} from '../controllers/operatorController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.post('/', authenticate, registerOperator);
router.get('/', authenticate, getOperators);
router.get('/:id', authenticate, getOperatorById);
router.put('/:id', authenticate, updateOperator);
router.put('/:id/blacklist', authenticate, authorize('caa_officer', 'admin', 'enforcement'), blacklistOperator);

export default router;

