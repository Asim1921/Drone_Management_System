import { Router } from 'express';
import {
  registerVendor,
  getVendors,
  getVendorById,
  registerDroneModel,
  getVendorModels,
} from '../controllers/vendorController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, registerVendor);
router.get('/', authenticate, getVendors);
router.get('/:id', authenticate, getVendorById);
router.post('/:id/models', authenticate, registerDroneModel);
router.get('/:id/models', authenticate, getVendorModels);

export default router;

