import mongoose, { Document, Schema } from 'mongoose';

export interface IOperator extends Document {
  userId: mongoose.Types.ObjectId;
  identityInfo: {
    cnic?: string;
    passport?: string;
    dateOfBirth?: Date;
    address?: string;
    city?: string;
    country: string;
  };
  trainingRecords: Array<{
    courseName: string;
    institution: string;
    completionDate: Date;
    certificateNumber?: string;
  }>;
  certifications: Array<{
    certificationType: string;
    issuedBy: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateNumber: string;
  }>;
  flightHistory: Array<{
    flightDate: Date;
    droneModel: string;
    location: string;
    duration: number;
    purpose: string;
  }>;
  experience: {
    totalFlights: number;
    totalFlightHours: number;
    yearsOfExperience: number;
  };
  blacklistStatus: {
    isBlacklisted: boolean;
    blacklistedAt?: Date;
    blacklistedBy?: mongoose.Types.ObjectId;
    reason?: string;
  };
  authorizedDroneTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OperatorSchema = new Schema<IOperator>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    identityInfo: {
      cnic: String,
      passport: String,
      dateOfBirth: Date,
      address: String,
      city: String,
      country: { type: String, default: 'Pakistan' },
    },
    trainingRecords: [
      {
        courseName: String,
        institution: String,
        completionDate: Date,
        certificateNumber: String,
      },
    ],
    certifications: [
      {
        certificationType: String,
        issuedBy: String,
        issueDate: Date,
        expiryDate: Date,
        certificateNumber: String,
      },
    ],
    flightHistory: [
      {
        flightDate: Date,
        droneModel: String,
        location: String,
        duration: Number,
        purpose: String,
      },
    ],
    experience: {
      totalFlights: { type: Number, default: 0 },
      totalFlightHours: { type: Number, default: 0 },
      yearsOfExperience: { type: Number, default: 0 },
    },
    blacklistStatus: {
      isBlacklisted: { type: Boolean, default: false },
      blacklistedAt: Date,
      blacklistedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: String,
    },
    authorizedDroneTypes: [String],
  },
  {
    timestamps: true,
  }
);

export const Operator = mongoose.model<IOperator>('Operator', OperatorSchema);

