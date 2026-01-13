import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import {
  createViolation,
  getViolations,
  getViolationById,
  resolveViolation,
  getViolationStats,
} from '../controllers/violationController';

const router = Router();

// Get violation statistics
router.get('/stats', authenticate, getViolationStats);

// Get all violations
router.get('/', authenticate, getViolations);

// Get violation by ID
router.get('/:id', authenticate, getViolationById);

// Create violation (only authorized roles)
router.post(
  '/',
  authenticate,
  authorize('admin', 'caa_officer', 'enforcement'),
  createViolation
);

// Resolve violation (only authorized roles)
router.put(
  '/:id/resolve',
  authenticate,
  authorize('admin', 'caa_officer', 'enforcement'),
  resolveViolation
);

export default router;

