import mongoose, { Document, Schema } from 'mongoose';

export type LicenseType = 'individual' | 'commercial' | 'government';
export type LicenseStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'expired' | 'renewed';

export interface ILicense extends Document {
  licenseType: LicenseType;
  operatorId: mongoose.Types.ObjectId;
  droneDetails: {
    model: string;
    serialNumber: string;
    manufacturer: string;
    weight: number;
    maxAltitude: number;
  };
  status: LicenseStatus;
  issueDate: Date;
  expiryDate: Date;
  renewalHistory: Array<{
    renewalDate: Date;
    previousExpiry: Date;
    newExpiry: Date;
  }>;
  suspensionStatus?: {
    isSuspended: boolean;
    suspendedAt?: Date;
    suspendedBy?: mongoose.Types.ObjectId;
    reason?: string;
  };
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LicenseSchema = new Schema<ILicense>(
  {
    licenseType: {
      type: String,
      enum: ['individual', 'commercial', 'government'],
      required: true,
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    droneDetails: {
      model: { type: String, required: true },
      serialNumber: { type: String, required: true, unique: true },
      manufacturer: { type: String, required: true },
      weight: { type: Number, required: true },
      maxAltitude: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended', 'expired', 'renewed'],
      default: 'pending',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    renewalHistory: [
      {
        renewalDate: Date,
        previousExpiry: Date,
        newExpiry: Date,
      },
    ],
    suspensionStatus: {
      isSuspended: { type: Boolean, default: false },
      suspendedAt: Date,
      suspendedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
  },
  {
    timestamps: true,
  }
);

export const License = mongoose.model<ILicense>('License', LicenseSchema);

