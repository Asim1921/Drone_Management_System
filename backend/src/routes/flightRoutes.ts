import { Router } from 'express';
import {
  createFlight,
  getFlights,
  getFlightById,
  approveFlight,
  rejectFlight,
  updateFlightStatus,
} from '../controllers/flightController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.post('/', authenticate, createFlight);
router.get('/', authenticate, getFlights);
router.get('/:id', authenticate, getFlightById);
router.put('/:id/approve', authenticate, authorize('caa_officer', 'admin'), approveFlight);
router.put('/:id/reject', authenticate, authorize('caa_officer', 'admin'), rejectFlight);
router.put('/:id/status', authenticate, updateFlightStatus);

export default router;

