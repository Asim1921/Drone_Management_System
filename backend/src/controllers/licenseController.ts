import { Response } from 'express';
import { License } from '../models/License';
import { AuthRequest } from '../middleware/auth';

export const createLicense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const licenseData = {
      ...req.body,
      operatorId: req.user?.id,
      status: 'pending',
    };

    const license = new License(licenseData);
    await license.save();
    await license.populate('operatorId', 'email profile');

    res.status(201).json({ message: 'License application submitted', license });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create license' });
  }
};

export const getLicenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, licenseType } = req.query;
    const filter: any = {};

    // Role-based filtering
    if (req.user?.role === 'operator') {
      filter.operatorId = req.user.id;
    }

    if (status) filter.status = status;
    if (licenseType) filter.licenseType = licenseType;

    const licenses = await License.find(filter)
      .populate('operatorId', 'email profile')
      .populate('approvedBy', 'email profile')
      .sort({ createdAt: -1 });

    res.json({ licenses });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch licenses' });
  }
};

export const getLicenseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const license = await License.findById(req.params.id)
      .populate('operatorId', 'email profile')
      .populate('approvedBy', 'email profile');

    if (!license) {
      res.status(404).json({ message: 'License not found' });
      return;
    }

    // Check access permissions
    if (req.user?.role === 'operator' && license.operatorId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json({ license });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch license' });
  }
};

export const approveLicense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const license = await License.findById(req.params.id);
    if (!license) {
      res.status(404).json({ message: 'License not found' });
      return;
    }

    license.status = 'approved';
    license.approvedBy = req.user?.id as any;
    license.approvedAt = new Date();
    await license.save();

    res.json({ message: 'License approved', license });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to approve license' });
  }
};

export const renewLicense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { newExpiryDate } = req.body;
    const license = await License.findById(req.params.id);

    if (!license) {
      res.status(404).json({ message: 'License not found' });
      return;
    }

    // Add to renewal history
    license.renewalHistory.push({
      renewalDate: new Date(),
      previousExpiry: license.expiryDate,
      newExpiry: new Date(newExpiryDate),
    });

    license.expiryDate = new Date(newExpiryDate);
    license.status = 'renewed';
    await license.save();

    res.json({ message: 'License renewed', license });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to renew license' });
  }
};

export const suspendLicense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const license = await License.findById(req.params.id);

    if (!license) {
      res.status(404).json({ message: 'License not found' });
      return;
    }

    license.status = 'suspended';
    license.suspensionStatus = {
      isSuspended: true,
      suspendedAt: new Date(),
      suspendedBy: req.user?.id as any,
      reason,
    };
    await license.save();

    res.json({ message: 'License suspended', license });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to suspend license' });
  }
};

