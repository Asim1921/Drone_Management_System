import { Response } from 'express';
import { Vendor } from '../models/Vendor';
import { DroneModel } from '../models/DroneModel';
import { AuthRequest } from '../middleware/auth';

export const registerVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorData = {
      ...req.body,
      userId: req.user?.id,
    };

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ userId: req.user?.id });
    if (existingVendor) {
      res.status(400).json({ message: 'Vendor already registered' });
      return;
    }

    const vendor = new Vendor(vendorData);
    await vendor.save();
    await vendor.populate('userId', 'email profile');

    res.status(201).json({ message: 'Vendor registered successfully', vendor });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to register vendor' });
  }
};

export const getVendors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    // Vendors can only see their own profile
    if (req.user?.role === 'vendor') {
      filter.userId = req.user.id;
    }

    const vendors = await Vendor.find(filter)
      .populate('userId', 'email profile')
      .populate('verifiedBy', 'email profile')
      .sort({ createdAt: -1 });

    res.json({ vendors });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch vendors' });
  }
};

export const getVendorById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('userId', 'email profile')
      .populate('verifiedBy', 'email profile');

    if (!vendor) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }

    // Check access permissions
    if (req.user?.role === 'vendor' && vendor.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json({ vendor });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch vendor' });
  }
};

export const registerDroneModel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user?.id });
    if (!vendor) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }

    const droneModelData = {
      ...req.body,
      vendorId: vendor._id,
    };

    const droneModel = new DroneModel(droneModelData);
    await droneModel.save();
    await droneModel.populate('vendorId');

    res.status(201).json({ message: 'Drone model registered', droneModel });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to register drone model' });
  }
};

export const getVendorModels = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }

    // Check permissions
    if (req.user?.role === 'vendor' && vendor.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const models = await DroneModel.find({ vendorId: vendor._id }).populate('vendorId');
    res.json({ models });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch drone models' });
  }
};

