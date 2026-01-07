import mongoose, { Document, Schema } from 'mongoose';

export type FlightStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';

export interface IFlight extends Document {
  operatorId: mongoose.Types.ObjectId;
  licenseId: mongoose.Types.ObjectId;
  flightDetails: {
    purpose: string;
    scheduledDate: Date;
    scheduledStartTime: string;
    scheduledEndTime: string;
    estimatedDuration: number; // in minutes
    maxAltitude: number; // in meters
    flightArea: {
      center: {
        latitude: number;
        longitude: number;
      };
      radius: number; // in meters
      address?: string;
    };
    weatherConditions?: string;
    notes?: string;
  };
  status: FlightStatus;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  actualFlightData?: {
    startTime?: Date;
    endTime?: Date;
    actualDuration?: number;
    actualMaxAltitude?: number;
    flightPath?: Array<{
      latitude: number;
      longitude: number;
      altitude: number;
      timestamp: Date;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FlightSchema = new Schema<IFlight>(
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
    flightDetails: {
      purpose: { type: String, required: true },
      scheduledDate: { type: Date, required: true },
      scheduledStartTime: { type: String, required: true },
      scheduledEndTime: { type: String, required: true },
      estimatedDuration: { type: Number, required: true },
      maxAltitude: { type: Number, required: true },
      flightArea: {
        center: {
          latitude: { type: Number, required: true },
          longitude: { type: Number, required: true },
        },
        radius: { type: Number, required: true },
        address: String,
      },
      weatherConditions: String,
      notes: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: Date,
    rejectionReason: String,
    actualFlightData: {
      startTime: Date,
      endTime: Date,
      actualDuration: Number,
      actualMaxAltitude: Number,
      flightPath: [
        {
          latitude: Number,
          longitude: Number,
          altitude: Number,
          timestamp: Date,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
FlightSchema.index({ operatorId: 1, status: 1 });
FlightSchema.index({ 'flightDetails.scheduledDate': 1 });
FlightSchema.index({ status: 1 });

export const Flight = mongoose.model<IFlight>('Flight', FlightSchema);

