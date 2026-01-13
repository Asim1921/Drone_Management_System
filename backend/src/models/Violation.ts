import mongoose, { Document, Schema } from 'mongoose';

export type ViolationCategory = 
  | 'unauthorized_area'
  | 'no_permission'
  | 'altitude_violation'
  | 'restricted_airspace'
  | 'missing_license'
  | 'expired_license'
  | 'safety_violation'
  | 'privacy_violation'
  | 'other';

export type ViolationStatus = 'pending' | 'resolved' | 'appealed';
export type WarningLevel = 0 | 1 | 2 | 3;

export interface IViolation extends Document {
  operatorId: mongoose.Types.ObjectId;
  licenseId: mongoose.Types.ObjectId;
  category: ViolationCategory;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  flightId?: mongoose.Types.ObjectId;
  violationDate: Date;
  fineAmount: number;
  status: ViolationStatus;
  warningLevel: WarningLevel;
  reportedBy: mongoose.Types.ObjectId;
  reportedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ViolationSchema = new Schema<IViolation>(
  {
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    licenseId: {
      type: Schema.Types.ObjectId,
      ref: 'License',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'unauthorized_area',
        'no_permission',
        'altitude_violation',
        'restricted_airspace',
        'missing_license',
        'expired_license',
        'safety_violation',
        'privacy_violation',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: String,
    },
    flightId: {
      type: Schema.Types.ObjectId,
      ref: 'Flight',
    },
    violationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    fineAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'appealed'],
      default: 'pending',
    },
    warningLevel: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ViolationSchema.index({ operatorId: 1, violationDate: -1 });
ViolationSchema.index({ licenseId: 1 });
ViolationSchema.index({ status: 1 });

export const Violation = mongoose.model<IViolation>('Violation', ViolationSchema);

