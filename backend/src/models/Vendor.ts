import mongoose, { Document, Schema } from 'mongoose';

export type VendorType = 'local' | 'foreign';

export interface IVendor extends Document {
  userId: mongoose.Types.ObjectId;
  companyInfo: {
    companyName: string;
    registrationNumber: string;
    taxId?: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    website?: string;
  };
  vendorType: VendorType;
  certifications: Array<{
    certificationType: string;
    issuedBy: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateNumber: string;
  }>;
  isVerified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  complianceStatus: {
    isCompliant: boolean;
    lastAuditDate?: Date;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyInfo: {
      companyName: { type: String, required: true },
      registrationNumber: { type: String, required: true, unique: true },
      taxId: String,
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      website: String,
    },
    vendorType: {
      type: String,
      enum: ['local', 'foreign'],
      required: true,
    },
    certifications: [
      {
        certificationType: String,
        issuedBy: String,
        issueDate: Date,
        expiryDate: Date,
        certificateNumber: String,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    complianceStatus: {
      isCompliant: { type: Boolean, default: true },
      lastAuditDate: Date,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Vendor = mongoose.model<IVendor>('Vendor', VendorSchema);

