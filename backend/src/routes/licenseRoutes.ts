import { Router } from 'express';
import {
  createLicense,
  getLicenses,
  getLicenseById,
  approveLicense,
  renewLicense,
  suspendLicense,
} from '../controllers/licenseController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.post('/', authenticate, createLicense);
router.get('/', authenticate, getLicenses);
router.get('/:id', authenticate, getLicenseById);
router.put('/:id/approve', authenticate, authorize('caa_officer', 'admin'), approveLicense);
router.put('/:id/renew', authenticate, renewLicense);
router.put('/:id/suspend', authenticate, authorize('caa_officer', 'admin'), suspendLicense);

export default router;

