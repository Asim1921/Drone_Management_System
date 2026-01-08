import { Response } from 'express';
import { Violation } from '../models/Violation';
import { License } from '../models/License';
import { AuthRequest } from '../middleware/auth';

export const createViolation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { operatorId, licenseId, category, description, location, flightId, violationDate, fineAmount } = req.body;

    // Find existing violations for this operator to calculate warning level
    const existingViolations = await Violation.find({
      operatorId,
      status: { $in: ['pending', 'resolved'] },
    }).sort({ createdAt: -1 });

    // Count warnings (resolved violations count as warnings)
    const warningCount = existingViolations.length;
    const newWarningLevel = Math.min(warningCount + 1, 3) as 0 | 1 | 2 | 3;

    // If this is the 3rd warning, suspend the license
    if (newWarningLevel >= 3) {
      const license = await License.findById(licenseId);
      if (license && !license.suspensionStatus?.isSuspended) {
        license.status = 'suspended';
        license.suspensionStatus = {
          isSuspended: true,
          suspendedAt: new Date(),
          suspendedBy: req.user?.id as any,
          reason: `License suspended due to ${newWarningLevel} violations. Last violation: ${description}`,
        };
        await license.save();
      }
    }

    const violation = new Violation({
      operatorId,
      licenseId,
      category,
      description,
      location,
      flightId,
      violationDate: violationDate || new Date(),
      fineAmount: fineAmount || 0,
      warningLevel: newWarningLevel,
      reportedBy: req.user?.id,
    });

    await violation.save();
    await violation.populate('operatorId', 'email profile');
    await violation.populate('licenseId');
    await violation.populate('reportedBy', 'email profile');

    res.status(201).json({
      message: newWarningLevel >= 3 ? 'Violation recorded and license suspended' : 'Violation recorded',
      violation,
      licenseSuspended: newWarningLevel >= 3,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create violation' });
  }
};

export const getViolations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { operatorId, licenseId, status, category } = req.query;
    const filter: any = {};

    // Role-based filtering
    if (req.user?.role === 'operator') {
      filter.operatorId = req.user.id;
    }

    if (operatorId) filter.operatorId = operatorId;
    if (licenseId) filter.licenseId = licenseId;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const violations = await Violation.find(filter)
      .populate('operatorId', 'email profile')
      .populate('licenseId')
      .populate('flightId')
      .populate('reportedBy', 'email profile')
      .populate('resolvedBy', 'email profile')
      .sort({ violationDate: -1 });

    res.json({ violations });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch violations' });
  }
};

export const getViolationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const violation = await Violation.findById(req.params.id)
      .populate('operatorId', 'email profile')
      .populate('licenseId')
      .populate('flightId')
      .populate('reportedBy', 'email profile')
      .populate('resolvedBy', 'email profile');

    if (!violation) {
      res.status(404).json({ message: 'Violation not found' });
      return;
    }

    // Check access permissions
    if (req.user?.role === 'operator' && violation.operatorId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json({ violation });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch violation' });
  }
};

export const resolveViolation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notes } = req.body;
    const violation = await Violation.findById(req.params.id);

    if (!violation) {
      res.status(404).json({ message: 'Violation not found' });
      return;
    }

    violation.status = 'resolved';
    violation.resolvedAt = new Date();
    violation.resolvedBy = req.user?.id as any;
    if (notes) violation.notes = notes;

    await violation.save();
    await violation.populate('operatorId', 'email profile');
    await violation.populate('licenseId');
    await violation.populate('resolvedBy', 'email profile');

    res.json({ message: 'Violation resolved', violation });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to resolve violation' });
  }
};

export const getViolationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    if (req.user?.role === 'operator') {
      filter.operatorId = req.user.id;
    }

    const totalViolations = await Violation.countDocuments(filter);
    const pendingViolations = await Violation.countDocuments({ ...filter, status: 'pending' });
    const resolvedViolations = await Violation.countDocuments({ ...filter, status: 'resolved' });
    const totalFines = await Violation.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$fineAmount' } } },
    ]);

    res.json({
      stats: {
        total: totalViolations,
        pending: pendingViolations,
        resolved: resolvedViolations,
        totalFines: totalFines[0]?.total || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch violation stats' });
  }
};

