import mongoose, { Document, Schema } from 'mongoose';

export type UseCase = 'commercial' | 'recreational' | 'government' | 'agriculture' | 'surveillance' | 'delivery';

export interface IDroneModel extends Document {
  vendorId: mongoose.Types.ObjectId;
  modelName: string;
  specifications: {
    weight: number;
    maxAltitude: number;
    maxSpeed: number;
    batteryLife: number;
    range: number;
    camera?: boolean;
    gps?: boolean;
  };
  useCases: UseCase[];
  remoteIdFormat: string;
  complianceStatus: {
    isCompliant: boolean;
    standards: string[];
    certificationDate?: Date;
  };
  serialNumberPrefix?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DroneModelSchema = new Schema<IDroneModel>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
    specifications: {
      weight: { type: Number, required: true },
      maxAltitude: { type: Number, required: true },
      maxSpeed: { type: Number, required: true },
      batteryLife: { type: Number, required: true },
      range: { type: Number, required: true },
      camera: Boolean,
      gps: Boolean,
    },
    useCases: [
      {
        type: String,
        enum: ['commercial', 'recreational', 'government', 'agriculture', 'surveillance', 'delivery'],
      },
    ],
    remoteIdFormat: {
      type: String,
      required: true,
    },
    complianceStatus: {
      isCompliant: { type: Boolean, default: false },
      standards: [String],
      certificationDate: Date,
    },
    serialNumberPrefix: String,
  },
  {
    timestamps: true,
  }
);

export const DroneModel = mongoose.model<IDroneModel>('DroneModel', DroneModelSchema);

