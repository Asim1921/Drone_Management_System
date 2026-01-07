import { Response } from 'express';
import { Operator } from '../models/Operator';
import { AuthRequest } from '../middleware/auth';

export const registerOperator = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const operatorData = {
      ...req.body,
      userId: req.user?.id,
    };

    // Check if operator already exists
    const existingOperator = await Operator.findOne({ userId: req.user?.id });
    if (existingOperator) {
      res.status(400).json({ message: 'Operator already registered' });
      return;
    }

    const operator = new Operator(operatorData);
    await operator.save();
    await operator.populate('userId', 'email profile');

    res.status(201).json({ message: 'Operator registered successfully', operator });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to register operator' });
  }
};

export const getOperators = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    // Operators can only see their own profile
    if (req.user?.role === 'operator') {
      filter.userId = req.user.id;
    }

    const operators = await Operator.find(filter)
      .populate('userId', 'email profile')
      .populate('blacklistStatus.blacklistedBy', 'email profile')
      .sort({ createdAt: -1 });

    res.json({ operators });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch operators' });
  }
};

export const getOperatorById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const operator = await Operator.findById(req.params.id)
      .populate('userId', 'email profile')
      .populate('blacklistStatus.blacklistedBy', 'email profile');

    if (!operator) {
      res.status(404).json({ message: 'Operator not found' });
      return;
    }

    // Check access permissions
    if (req.user?.role === 'operator' && operator.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json({ operator });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch operator' });
  }
};

export const updateOperator = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const operator = await Operator.findById(req.params.id);

    if (!operator) {
      res.status(404).json({ message: 'Operator not found' });
      return;
    }

    // Check permissions
    if (req.user?.role === 'operator' && operator.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    Object.assign(operator, req.body);
    await operator.save();
    await operator.populate('userId', 'email profile');

    res.json({ message: 'Operator updated', operator });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update operator' });
  }
};

export const blacklistOperator = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const operator = await Operator.findById(req.params.id);

    if (!operator) {
      res.status(404).json({ message: 'Operator not found' });
      return;
    }

    operator.blacklistStatus = {
      isBlacklisted: true,
      blacklistedAt: new Date(),
      blacklistedBy: req.user?.id as any,
      reason,
    };
    await operator.save();

    res.json({ message: 'Operator blacklisted', operator });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to blacklist operator' });
  }
};

