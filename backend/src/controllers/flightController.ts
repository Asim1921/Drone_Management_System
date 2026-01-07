import { Response } from 'express';
import mongoose from 'mongoose';
import { Flight } from '../models/Flight';
import { License } from '../models/License';
import { AuthRequest } from '../middleware/auth';

export const createFlight = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only operators can create flights
    if (req.user?.role !== 'operator') {
      res.status(403).json({ message: 'Only operators can schedule flights' });
      return;
    }

    // Verify license exists and is approved
    const license = await License.findById(req.body.licenseId);
    if (!license) {
      res.status(404).json({ message: 'License not found' });
      return;
    }

    if (license.status !== 'approved') {
      res.status(400).json({ message: 'License must be approved to schedule flights' });
      return;
    }

    if (license.operatorId.toString() !== req.user.id) {
      res.status(403).json({ message: 'You can only schedule flights with your own licenses' });
      return;
    }

    const flightData = {
      ...req.body,
      operatorId: req.user.id,
      status: 'pending',
    };

    const flight = new Flight(flightData);
    await flight.save();
    await flight.populate('operatorId', 'email profile');
    await flight.populate('licenseId');

    res.status(201).json({ message: 'Flight scheduled successfully', flight });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create flight' });
  }
};

export const getFlights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, operatorId } = req.query;
    const filter: any = {};

    // Role-based filtering
    if (req.user?.role === 'operator') {
      filter.operatorId = req.user.id;
    } else if (req.user?.role === 'admin' || req.user?.role === 'caa_officer') {
      // Admins and CAA officers can see all flights
      if (operatorId) {
        filter.operatorId = operatorId;
      }
    } else {
      res.status(403).json({ message: 'You do not have permission to view flights' });
      return;
    }

    if (status) filter.status = status;

    const flights = await Flight.find(filter)
      .populate('operatorId', 'email profile')
      .populate('licenseId')
      .populate('approvedBy', 'email profile')
      .populate('rejectedBy', 'email profile')
      .sort({ 'flightDetails.scheduledDate': 1, createdAt: -1 });

    res.json({ flights });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch flights' });
  }
};

export const getFlightById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('operatorId', 'email profile')
      .populate('licenseId')
      .populate('approvedBy', 'email profile')
      .populate('rejectedBy', 'email profile');

    if (!flight) {
      res.status(404).json({ message: 'Flight not found' });
      return;
    }

    // Check permissions
    if (req.user?.role === 'operator' && flight.operatorId.toString() !== req.user.id) {
      res.status(403).json({ message: 'You do not have permission to view this flight' });
      return;
    }

    if (!['admin', 'caa_officer', 'operator'].includes(req.user?.role || '')) {
      res.status(403).json({ message: 'You do not have permission to view flights' });
      return;
    }

    res.json({ flight });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch flight' });
  }
};

export const approveFlight = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins and CAA officers can approve flights
    if (!['admin', 'caa_officer'].includes(req.user?.role || '')) {
      res.status(403).json({ message: 'Only admins and CAA officers can approve flights' });
      return;
    }

    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      res.status(404).json({ message: 'Flight not found' });
      return;
    }

    if (flight.status !== 'pending') {
      res.status(400).json({ message: 'Flight is not in pending status' });
      return;
    }

    flight.status = 'approved';
    flight.approvedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;
    flight.approvedAt = new Date();
    await flight.save();

    await flight.populate('operatorId', 'email profile');
    await flight.populate('licenseId');

    res.json({ message: 'Flight approved successfully', flight });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to approve flight' });
  }
};

export const rejectFlight = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins and CAA officers can reject flights
    if (!['admin', 'caa_officer'].includes(req.user?.role || '')) {
      res.status(403).json({ message: 'Only admins and CAA officers can reject flights' });
      return;
    }

    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      res.status(400).json({ message: 'Rejection reason is required' });
      return;
    }

    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      res.status(404).json({ message: 'Flight not found' });
      return;
    }

    if (flight.status !== 'pending') {
      res.status(400).json({ message: 'Flight is not in pending status' });
      return;
    }

    flight.status = 'rejected';
    flight.rejectedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;
    flight.rejectedAt = new Date();
    flight.rejectionReason = rejectionReason;
    await flight.save();

    await flight.populate('operatorId', 'email profile');
    await flight.populate('licenseId');

    res.json({ message: 'Flight rejected successfully', flight });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to reject flight' });
  }
};

export const updateFlightStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      res.status(404).json({ message: 'Flight not found' });
      return;
    }

    // Only operators can update their own flight status to in_progress, completed, or cancelled
    if (req.user?.role === 'operator') {
      if (flight.operatorId.toString() !== req.user.id) {
        res.status(403).json({ message: 'You can only update your own flights' });
        return;
      }

      if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
        res.status(400).json({ message: 'Invalid status for operator update' });
        return;
      }

      if (flight.status !== 'approved' && status === 'in_progress') {
        res.status(400).json({ message: 'Flight must be approved before starting' });
        return;
      }
    }

    flight.status = status;
    if (status === 'in_progress' && !flight.actualFlightData?.startTime) {
      if (!flight.actualFlightData) {
        flight.actualFlightData = {};
      }
      flight.actualFlightData.startTime = new Date();
    } else if (status === 'completed' && flight.actualFlightData?.startTime) {
      if (!flight.actualFlightData.endTime) {
        flight.actualFlightData.endTime = new Date();
        const duration = Math.round(
          (flight.actualFlightData.endTime.getTime() - flight.actualFlightData.startTime.getTime()) / 60000
        );
        flight.actualFlightData.actualDuration = duration;
      }
    }

    await flight.save();
    await flight.populate('operatorId', 'email profile');
    await flight.populate('licenseId');

    res.json({ message: 'Flight status updated successfully', flight });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update flight status' });
  }
};

