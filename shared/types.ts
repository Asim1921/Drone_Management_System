export type UserRole = 'admin' | 'caa_officer' | 'operator' | 'vendor' | 'enforcement' | 'audit_officer';
export type LicenseType = 'individual' | 'commercial' | 'government';
export type LicenseStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'expired' | 'renewed';
export type VendorType = 'local' | 'foreign';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    organization?: string;
  };
  isActive?: boolean;
  isEmailVerified?: boolean;
}

export interface License {
  _id: string;
  licenseType: LicenseType;
  operatorId: string | User;
  droneDetails: {
    model: string;
    serialNumber: string;
    manufacturer: string;
    weight: number;
    maxAltitude: number;
  };
  status: LicenseStatus;
  issueDate: string;
  expiryDate: string;
  renewalHistory: Array<{
    renewalDate: string;
    previousExpiry: string;
    newExpiry: string;
  }>;
  suspensionStatus?: {
    isSuspended: boolean;
    suspendedAt?: string;
    suspendedBy?: string | User;
    reason?: string;
  };
  approvedBy?: string | User;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Operator {
  _id: string;
  userId: string | User;
  identityInfo: {
    cnic?: string;
    passport?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    country: string;
  };
  trainingRecords: Array<{
    courseName: string;
    institution: string;
    completionDate: string;
    certificateNumber?: string;
  }>;
  certifications: Array<{
    certificationType: string;
    issuedBy: string;
    issueDate: string;
    expiryDate?: string;
    certificateNumber: string;
  }>;
  flightHistory: Array<{
    flightDate: string;
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
    blacklistedAt?: string;
    blacklistedBy?: string | User;
    reason?: string;
  };
  authorizedDroneTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  _id: string;
  userId: string | User;
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
    issueDate: string;
    expiryDate?: string;
    certificateNumber: string;
  }>;
  isVerified: boolean;
  verifiedBy?: string | User;
  verifiedAt?: string;
  complianceStatus: {
    isCompliant: boolean;
    lastAuditDate?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DroneModel {
  _id: string;
  vendorId: string | Vendor;
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
  useCases: string[];
  remoteIdFormat: string;
  complianceStatus: {
    isCompliant: boolean;
    standards: string[];
    certificationDate?: string;
  };
  serialNumberPrefix?: string;
  createdAt: string;
  updatedAt: string;
}

