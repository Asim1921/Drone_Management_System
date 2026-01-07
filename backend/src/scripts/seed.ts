import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { User } from '../models/User';
import { License } from '../models/License';
import { Operator } from '../models/Operator';
import { Vendor } from '../models/Vendor';
import { DroneModel } from '../models/DroneModel';
import { Flight } from '../models/Flight';
import { connectDB } from '../config/database';
const bcrypt = require('bcryptjs');

dotenv.config();

// Drone models data - 50+ different drones
const droneModelsData: Array<{
  modelName: string;
  manufacturer: string;
  weight: number;
  maxAltitude: number;
  maxSpeed: number;
  batteryLife: number;
  range: number;
  camera: boolean;
  gps: boolean;
  useCases: string[];
}> = [
  // DJI Drones
  { modelName: 'DJI Phantom 4 Pro', manufacturer: 'DJI', weight: 1.388, maxAltitude: 6000, maxSpeed: 72, batteryLife: 30, range: 7000, camera: true, gps: true, useCases: ['commercial', 'recreational'] },
  { modelName: 'DJI Mavic 3', manufacturer: 'DJI', weight: 0.895, maxAltitude: 6000, maxSpeed: 75, batteryLife: 46, range: 15000, camera: true, gps: true, useCases: ['commercial', 'recreational'] },
  { modelName: 'DJI Air 2S', manufacturer: 'DJI', weight: 0.595, maxAltitude: 5000, maxSpeed: 68, batteryLife: 31, range: 12000, camera: true, gps: true, useCases: ['commercial', 'recreational'] },
  { modelName: 'DJI Mini 3 Pro', manufacturer: 'DJI', weight: 0.249, maxAltitude: 4000, maxSpeed: 57, batteryLife: 47, range: 12000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'DJI Inspire 2', manufacturer: 'DJI', weight: 3.44, maxAltitude: 5000, maxSpeed: 94, batteryLife: 27, range: 7000, camera: true, gps: true, useCases: ['commercial', 'government'] },
  { modelName: 'DJI Matrice 300 RTK', manufacturer: 'DJI', weight: 3.6, maxAltitude: 5000, maxSpeed: 82, batteryLife: 55, range: 15000, camera: true, gps: true, useCases: ['commercial', 'government', 'surveillance'] },
  { modelName: 'DJI Agras T30', manufacturer: 'DJI', weight: 24.5, maxAltitude: 3000, maxSpeed: 36, batteryLife: 20, range: 3000, camera: true, gps: true, useCases: ['agriculture', 'commercial'] },
  { modelName: 'DJI FPV', manufacturer: 'DJI', weight: 0.795, maxAltitude: 6000, maxSpeed: 140, batteryLife: 20, range: 10000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'DJI Avata', manufacturer: 'DJI', weight: 0.41, maxAltitude: 5000, maxSpeed: 100, batteryLife: 23, range: 11000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'DJI Mavic 2 Pro', manufacturer: 'DJI', weight: 0.907, maxAltitude: 6000, maxSpeed: 72, batteryLife: 31, range: 8000, camera: true, gps: true, useCases: ['commercial', 'recreational'] },
  
  // Parrot Drones
  { modelName: 'Parrot Anafi', manufacturer: 'Parrot', weight: 0.32, maxAltitude: 4500, maxSpeed: 55, batteryLife: 25, range: 4000, camera: true, gps: true, useCases: ['commercial', 'recreational'] },
  { modelName: 'Parrot Bebop 2', manufacturer: 'Parrot', weight: 0.5, maxAltitude: 150, maxSpeed: 60, batteryLife: 25, range: 2000, camera: true, gps: true, useCases: ['recreational'] },
  { modelName: 'Parrot Disco', manufacturer: 'Parrot', weight: 0.75, maxAltitude: 4000, maxSpeed: 80, batteryLife: 45, range: 2000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  
  // Autel Drones
  { modelName: 'Autel EVO II Pro', manufacturer: 'Autel Robotics', weight: 1.15, maxAltitude: 8000, maxSpeed: 72, batteryLife: 40, range: 9000, camera: true, gps: true, useCases: ['commercial', 'government'] },
  { modelName: 'Autel EVO Lite+', manufacturer: 'Autel Robotics', weight: 0.835, maxAltitude: 6000, maxSpeed: 68, batteryLife: 40, range: 12000, camera: true, gps: true, useCases: ['commercial', 'recreational'] },
  { modelName: 'Autel Dragonfish', manufacturer: 'Autel Robotics', weight: 6.8, maxAltitude: 5000, maxSpeed: 80, batteryLife: 120, range: 20000, camera: true, gps: true, useCases: ['government', 'surveillance', 'commercial'] },
  
  // Yuneec Drones
  { modelName: 'Yuneec Typhoon H Pro', manufacturer: 'Yuneec', weight: 1.95, maxAltitude: 4000, maxSpeed: 60, batteryLife: 25, range: 1000, camera: true, gps: true, useCases: ['commercial', 'recreational'] },
  { modelName: 'Yuneec Mantis Q', manufacturer: 'Yuneec', weight: 0.5, maxAltitude: 4000, maxSpeed: 72, batteryLife: 33, range: 4000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'Yuneec Breeze', manufacturer: 'Yuneec', weight: 0.385, maxAltitude: 80, maxSpeed: 18, batteryLife: 12, range: 100, camera: true, gps: true, useCases: ['recreational'] },
  
  // Skydio Drones
  { modelName: 'Skydio 2+', manufacturer: 'Skydio', weight: 0.775, maxAltitude: 4000, maxSpeed: 36, batteryLife: 27, range: 6000, camera: true, gps: true, useCases: ['commercial', 'recreational'] },
  { modelName: 'Skydio X2', manufacturer: 'Skydio', weight: 1.35, maxAltitude: 5000, maxSpeed: 58, batteryLife: 35, range: 6000, camera: true, gps: true, useCases: ['government', 'surveillance', 'commercial'] },
  
  // Agricultural Drones
  { modelName: 'AgEagle eBee X', manufacturer: 'AgEagle', weight: 1.15, maxAltitude: 4000, maxSpeed: 110, batteryLife: 90, range: 50000, camera: true, gps: true, useCases: ['agriculture', 'commercial'] },
  { modelName: 'PrecisionHawk Lancaster 5', manufacturer: 'PrecisionHawk', weight: 2.5, maxAltitude: 4000, maxSpeed: 85, batteryLife: 60, range: 30000, camera: true, gps: true, useCases: ['agriculture', 'commercial'] },
  { modelName: 'Yamaha RMAX', manufacturer: 'Yamaha', weight: 94, maxAltitude: 150, maxSpeed: 80, batteryLife: 90, range: 90000, camera: false, gps: true, useCases: ['agriculture', 'commercial'] },
  { modelName: 'DJI T40', manufacturer: 'DJI', weight: 26.5, maxAltitude: 3000, maxSpeed: 40, batteryLife: 22, range: 3000, camera: true, gps: true, useCases: ['agriculture', 'commercial'] },
  { modelName: 'XAG P100', manufacturer: 'XAG', weight: 28, maxAltitude: 3000, maxSpeed: 35, batteryLife: 25, range: 3500, camera: true, gps: true, useCases: ['agriculture', 'commercial'] },
  
  // Delivery Drones
  { modelName: 'Wingcopter 198', manufacturer: 'Wingcopter', weight: 25, maxAltitude: 5000, maxSpeed: 240, batteryLife: 75, range: 100000, camera: true, gps: true, useCases: ['delivery', 'commercial'] },
  { modelName: 'Zipline P1', manufacturer: 'Zipline', weight: 22, maxAltitude: 4000, maxSpeed: 128, batteryLife: 60, range: 80000, camera: true, gps: true, useCases: ['delivery', 'commercial'] },
  { modelName: 'Amazon Prime Air', manufacturer: 'Amazon', weight: 25, maxAltitude: 400, maxSpeed: 80, batteryLife: 30, range: 15000, camera: true, gps: true, useCases: ['delivery', 'commercial'] },
  { modelName: 'UPS Flight Forward', manufacturer: 'UPS', weight: 20, maxAltitude: 400, maxSpeed: 70, batteryLife: 30, range: 12000, camera: true, gps: true, useCases: ['delivery', 'commercial'] },
  
  // Surveillance/Government Drones
  { modelName: 'AeroVironment Puma AE', manufacturer: 'AeroVironment', weight: 6.3, maxAltitude: 15000, maxSpeed: 83, batteryLife: 210, range: 15000, camera: true, gps: true, useCases: ['government', 'surveillance'] },
  { modelName: 'Insitu ScanEagle', manufacturer: 'Insitu', weight: 22, maxAltitude: 19500, maxSpeed: 110, batteryLife: 1800, range: 100000, camera: true, gps: true, useCases: ['government', 'surveillance'] },
  { modelName: 'General Atomics MQ-9 Reaper', manufacturer: 'General Atomics', weight: 2223, maxAltitude: 50000, maxSpeed: 482, batteryLife: 14400, range: 1852000, camera: true, gps: true, useCases: ['government', 'surveillance'] },
  { modelName: 'Northrop Grumman Global Hawk', manufacturer: 'Northrop Grumman', weight: 14628, maxAltitude: 60000, maxSpeed: 629, batteryLife: 28800, range: 22224000, camera: true, gps: true, useCases: ['government', 'surveillance'] },
  { modelName: 'AeroVironment RQ-11 Raven', manufacturer: 'AeroVironment', weight: 1.9, maxAltitude: 15000, maxSpeed: 90, batteryLife: 90, range: 10000, camera: true, gps: true, useCases: ['government', 'surveillance'] },
  
  // Commercial Photography Drones
  { modelName: 'Freefly Alta 8', manufacturer: 'Freefly Systems', weight: 9.5, maxAltitude: 4000, maxSpeed: 60, batteryLife: 20, range: 2000, camera: true, gps: true, useCases: ['commercial'] },
  { modelName: 'DJI Ronin 4D', manufacturer: 'DJI', weight: 4.4, maxAltitude: 5000, maxSpeed: 72, batteryLife: 45, range: 6000, camera: true, gps: true, useCases: ['commercial'] },
  { modelName: 'Freefly Astro', manufacturer: 'Freefly Systems', weight: 1.5, maxAltitude: 4000, maxSpeed: 65, batteryLife: 25, range: 3000, camera: true, gps: true, useCases: ['commercial'] },
  
  // Racing Drones
  { modelName: 'DJI FPV Racing', manufacturer: 'DJI', weight: 0.795, maxAltitude: 6000, maxSpeed: 140, batteryLife: 20, range: 10000, camera: true, gps: true, useCases: ['recreational'] },
  { modelName: 'Tiny Whoop', manufacturer: 'BetaFPV', weight: 0.03, maxAltitude: 100, maxSpeed: 60, batteryLife: 4, range: 200, camera: true, gps: false, useCases: ['recreational'] },
  { modelName: 'Emax Tinyhawk 2', manufacturer: 'Emax', weight: 0.031, maxAltitude: 100, maxSpeed: 70, batteryLife: 5, range: 300, camera: true, gps: false, useCases: ['recreational'] },
  
  // Industrial/Inspection Drones
  { modelName: 'Flyability Elios 2', manufacturer: 'Flyability', weight: 1.3, maxAltitude: 3000, maxSpeed: 25, batteryLife: 12, range: 1000, camera: true, gps: true, useCases: ['commercial', 'surveillance'] },
  { modelName: 'DJI Matrice 30T', manufacturer: 'DJI', weight: 3.77, maxAltitude: 5000, maxSpeed: 82, batteryLife: 55, range: 15000, camera: true, gps: true, useCases: ['commercial', 'government', 'surveillance'] },
  { modelName: 'Parrot Anafi Thermal', manufacturer: 'Parrot', weight: 0.32, maxAltitude: 4500, maxSpeed: 55, batteryLife: 26, range: 4000, camera: true, gps: true, useCases: ['commercial', 'surveillance'] },
  
  // More Commercial Drones
  { modelName: 'PowerVision PowerEgg X', manufacturer: 'PowerVision', weight: 1.2, maxAltitude: 4000, maxSpeed: 65, batteryLife: 30, range: 6000, camera: true, gps: true, useCases: ['commercial', 'recreational'] },
  { modelName: 'Hubsan Zino Pro', manufacturer: 'Hubsan', weight: 0.7, maxAltitude: 4000, maxSpeed: 65, batteryLife: 33, range: 7000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'Fimi X8 SE', manufacturer: 'Fimi', weight: 0.765, maxAltitude: 4000, maxSpeed: 65, batteryLife: 35, range: 8000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'Potensic Dreamer Pro', manufacturer: 'Potensic', weight: 0.5, maxAltitude: 4000, maxSpeed: 60, batteryLife: 25, range: 4000, camera: true, gps: true, useCases: ['recreational'] },
  { modelName: 'Holy Stone HS720E', manufacturer: 'Holy Stone', weight: 0.5, maxAltitude: 4000, maxSpeed: 50, batteryLife: 26, range: 3000, camera: true, gps: true, useCases: ['recreational'] },
  { modelName: 'Ruko F11 Pro', manufacturer: 'Ruko', weight: 0.5, maxAltitude: 4000, maxSpeed: 60, batteryLife: 30, range: 4000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'SNAPTAIN SP650', manufacturer: 'SNAPTAIN', weight: 0.3, maxAltitude: 3000, maxSpeed: 40, batteryLife: 20, range: 2000, camera: true, gps: true, useCases: ['recreational'] },
  { modelName: 'Contixo F24', manufacturer: 'Contixo', weight: 0.4, maxAltitude: 4000, maxSpeed: 55, batteryLife: 25, range: 3000, camera: true, gps: true, useCases: ['recreational'] },
  { modelName: 'Altair AA108', manufacturer: 'Altair', weight: 0.2, maxAltitude: 2000, maxSpeed: 30, batteryLife: 15, range: 1000, camera: true, gps: false, useCases: ['recreational'] },
  { modelName: 'DROCON Blue Bug', manufacturer: 'DROCON', weight: 0.15, maxAltitude: 100, maxSpeed: 25, batteryLife: 8, range: 200, camera: true, gps: false, useCases: ['recreational'] },
  { modelName: 'Syma X5C', manufacturer: 'Syma', weight: 0.1, maxAltitude: 50, maxSpeed: 20, batteryLife: 7, range: 100, camera: true, gps: false, useCases: ['recreational'] },
  { modelName: 'JJRC H68', manufacturer: 'JJRC', weight: 0.25, maxAltitude: 2000, maxSpeed: 35, batteryLife: 18, range: 1500, camera: true, gps: false, useCases: ['recreational'] },
  { modelName: 'Eachine E520S', manufacturer: 'Eachine', weight: 0.35, maxAltitude: 3000, maxSpeed: 45, batteryLife: 22, range: 2500, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'Force1 U49WF', manufacturer: 'Force1', weight: 0.3, maxAltitude: 2000, maxSpeed: 40, batteryLife: 20, range: 2000, camera: true, gps: false, useCases: ['recreational'] },
  { modelName: 'Tello EDU', manufacturer: 'Ryze Tech', weight: 0.08, maxAltitude: 30, maxSpeed: 28, batteryLife: 13, range: 100, camera: true, gps: false, useCases: ['recreational'] },
  { modelName: 'DJI Tello', manufacturer: 'DJI', weight: 0.08, maxAltitude: 30, maxSpeed: 28, batteryLife: 13, range: 100, camera: true, gps: false, useCases: ['recreational'] },
  { modelName: 'Ryze Tello', manufacturer: 'Ryze Tech', weight: 0.08, maxAltitude: 30, maxSpeed: 28, batteryLife: 13, range: 100, camera: true, gps: false, useCases: ['recreational'] },
  { modelName: 'DJI Spark', manufacturer: 'DJI', weight: 0.3, maxAltitude: 4000, maxSpeed: 50, batteryLife: 16, range: 2000, camera: true, gps: true, useCases: ['recreational'] },
  { modelName: 'DJI Mavic Mini', manufacturer: 'DJI', weight: 0.249, maxAltitude: 3000, maxSpeed: 47, batteryLife: 30, range: 4000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'DJI Mavic Air 2', manufacturer: 'DJI', weight: 0.57, maxAltitude: 5000, maxSpeed: 68, batteryLife: 34, range: 10000, camera: true, gps: true, useCases: ['commercial', 'recreational'] },
  { modelName: 'DJI Mini 2', manufacturer: 'DJI', weight: 0.249, maxAltitude: 4000, maxSpeed: 57, batteryLife: 31, range: 10000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'DJI Mini 3', manufacturer: 'DJI', weight: 0.249, maxAltitude: 4000, maxSpeed: 57, batteryLife: 38, range: 12000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'DJI Mini 4 Pro', manufacturer: 'DJI', weight: 0.249, maxAltitude: 4000, maxSpeed: 57, batteryLife: 45, range: 12000, camera: true, gps: true, useCases: ['recreational', 'commercial'] },
  { modelName: 'DJI Mavic 3 Classic', manufacturer: 'DJI', weight: 0.895, maxAltitude: 6000, maxSpeed: 75, batteryLife: 46, range: 15000, camera: true, gps: true, useCases: ['commercial', 'recreational'] },
  { modelName: 'DJI Mavic 3 Enterprise', manufacturer: 'DJI', weight: 0.915, maxAltitude: 5000, maxSpeed: 75, batteryLife: 45, range: 15000, camera: true, gps: true, useCases: ['commercial', 'government', 'surveillance'] },
  { modelName: 'DJI Matrice 30', manufacturer: 'DJI', weight: 3.77, maxAltitude: 5000, maxSpeed: 82, batteryLife: 55, range: 15000, camera: true, gps: true, useCases: ['commercial', 'government'] },
  { modelName: 'DJI Matrice 350 RTK', manufacturer: 'DJI', weight: 4.2, maxAltitude: 5000, maxSpeed: 82, batteryLife: 55, range: 15000, camera: true, gps: true, useCases: ['commercial', 'government', 'surveillance'] },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear existing data - IMPORTANT: Delete in order to respect foreign key constraints
    console.log('Clearing existing data...');
    await Flight.deleteMany({});
    await License.deleteMany({});
    await Operator.deleteMany({});
    await Vendor.deleteMany({});
    await DroneModel.deleteMany({});
    await User.deleteMany({});

    // Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const baseUsers = [
      {
        email: 'admin@dms.gov.pk',
        password: hashedPassword,
        role: 'admin' as const,
        profile: { firstName: 'Admin', lastName: 'User', phone: '+92-300-1234567' },
        isEmailVerified: true,
        isActive: true,
      },
      {
        email: 'caa.officer@dms.gov.pk',
        password: hashedPassword,
        role: 'caa_officer' as const,
        profile: { firstName: 'Ahmed', lastName: 'Khan', phone: '+92-300-1234568', organization: 'CAA Pakistan' },
        isEmailVerified: true,
        isActive: true,
      },
      {
        email: 'operator1@dms.gov.pk',
        password: hashedPassword,
        role: 'operator' as const,
        profile: { firstName: 'Ali', lastName: 'Hassan', phone: '+92-300-1234569' },
        isEmailVerified: true,
        isActive: true,
      },
      {
        email: 'operator2@dms.gov.pk',
        password: hashedPassword,
        role: 'operator' as const,
        profile: { firstName: 'Fatima', lastName: 'Ahmed', phone: '+92-300-1234570' },
        isEmailVerified: true,
        isActive: true,
      },
      {
        email: 'vendor1@dms.gov.pk',
        password: hashedPassword,
        role: 'vendor' as const,
        profile: { firstName: 'Tech', lastName: 'Solutions', phone: '+92-300-1234571', organization: 'Tech Solutions Pakistan' },
        isEmailVerified: true,
        isActive: true,
      },
      {
        email: 'enforcement@dms.gov.pk',
        password: hashedPassword,
        role: 'enforcement' as const,
        profile: { firstName: 'Security', lastName: 'Agency', phone: '+92-300-1234572', organization: 'Security Forces' },
        isEmailVerified: true,
        isActive: true,
      },
      {
        email: 'audit@dms.gov.pk',
        password: hashedPassword,
        role: 'audit_officer' as const,
        profile: { firstName: 'Audit', lastName: 'Officer', phone: '+92-300-1234573', organization: 'Audit Department' },
        isEmailVerified: true,
        isActive: true,
      },
    ];

    // Create additional operator users
    for (let i = 3; i <= 10; i++) {
      baseUsers.push({
        email: `operator${i}@dms.gov.pk`,
        password: hashedPassword,
        role: 'operator' as const,
        profile: {
          firstName: ['Hassan', 'Usman', 'Bilal', 'Zain', 'Ahmed', 'Omar', 'Khalid', 'Saeed'][i % 8],
          lastName: ['Khan', 'Ali', 'Ahmed', 'Malik', 'Butt', 'Sheikh', 'Raza', 'Hussain'][i % 8],
          phone: `+92-300-1234${570 + i}`,
        },
        isEmailVerified: true,
        isActive: true,
      });
    }

    const users = await User.insertMany(baseUsers);
    console.log(`Created ${users.length} users`);

    // Create vendors
    console.log('Creating vendors...');
    const vendor1 = await Vendor.create({
      userId: users.find(u => u.role === 'vendor')?._id,
      companyInfo: {
        companyName: 'Tech Solutions Pakistan',
        registrationNumber: 'VND-001-PK',
        taxId: 'TAX-123456',
        address: '123 Main Street',
        city: 'Karachi',
        country: 'Pakistan',
        phone: '+92-21-1234567',
        email: 'vendor1@dms.gov.pk',
        website: 'https://techsolutions.pk',
      },
      vendorType: 'local',
      isVerified: true,
      verifiedBy: users.find(u => u.role === 'caa_officer')?._id,
      verifiedAt: new Date(),
      complianceStatus: {
        isCompliant: true,
        lastAuditDate: new Date(),
      },
    });

    const vendor2 = await Vendor.create({
      userId: users.find(u => u.email === 'caa.officer@dms.gov.pk')?._id,
      companyInfo: {
        companyName: 'Global Drone Imports Ltd',
        registrationNumber: 'VND-002-PK',
        taxId: 'TAX-789012',
        address: '456 Business Avenue',
        city: 'Lahore',
        country: 'Pakistan',
        phone: '+92-42-7654321',
        email: 'imports@globaldrones.com',
        website: 'https://globaldrones.com',
      },
      vendorType: 'foreign',
      isVerified: true,
      verifiedBy: users.find(u => u.role === 'admin')?._id,
      verifiedAt: new Date(),
      complianceStatus: {
        isCompliant: true,
        lastAuditDate: new Date(),
      },
    });

    console.log(`Created ${await Vendor.countDocuments()} vendors`);

    // Create drone models
    console.log('Creating drone models...');
    const droneModels = [];
    const droneModelMap = new Map(); // Map to store manufacturer info
    
    for (const droneData of droneModelsData) {
      const vendor = Math.random() > 0.5 ? vendor1 : vendor2;
      const model = await DroneModel.create({
        vendorId: vendor._id,
        modelName: droneData.modelName,
        specifications: {
          weight: droneData.weight,
          maxAltitude: droneData.maxAltitude,
          maxSpeed: droneData.maxSpeed,
          batteryLife: droneData.batteryLife,
          range: droneData.range,
          camera: droneData.camera,
          gps: droneData.gps,
        },
        useCases: droneData.useCases,
        remoteIdFormat: `REM-${droneData.modelName.replace(/\s+/g, '-').toUpperCase()}`,
        complianceStatus: {
          isCompliant: true,
          standards: ['ISO 9001', 'CE Marking'],
          certificationDate: new Date(),
        },
        serialNumberPrefix: droneData.manufacturer.substring(0, 3).toUpperCase(),
      });
      droneModels.push(model);
      droneModelMap.set(model._id.toString(), droneData.manufacturer);
    }

    console.log(`Created ${droneModels.length} drone models`);

    // Create operators
    console.log('Creating operators...');
    const operator1 = await Operator.create({
      userId: users.find(u => u.email === 'operator1@dms.gov.pk')?._id,
      identityInfo: {
        cnic: '42101-1234567-8',
        dateOfBirth: new Date('1990-01-15'),
        address: 'House 123, Street 45',
        city: 'Karachi',
        country: 'Pakistan',
      },
      trainingRecords: [
        {
          courseName: 'Basic Drone Operation',
          institution: 'CAA Training Center',
          completionDate: new Date('2023-01-15'),
          certificateNumber: 'CERT-001',
        },
        {
          courseName: 'Advanced Flight Operations',
          institution: 'Aviation Academy',
          completionDate: new Date('2023-06-20'),
          certificateNumber: 'CERT-002',
        },
      ],
      certifications: [
        {
          certificationType: 'Commercial Drone Pilot',
          issuedBy: 'CAA Pakistan',
          issueDate: new Date('2023-02-01'),
          expiryDate: new Date('2026-02-01'),
          certificateNumber: 'CDP-2023-001',
        },
      ],
      flightHistory: [
        {
          flightDate: new Date('2024-01-10'),
          droneModel: 'DJI Mavic 3',
          location: 'Karachi',
          duration: 25,
          purpose: 'Aerial Photography',
        },
        {
          flightDate: new Date('2024-01-15'),
          droneModel: 'DJI Phantom 4 Pro',
          location: 'Lahore',
          duration: 20,
          purpose: 'Surveying',
        },
      ],
      experience: {
        totalFlights: 45,
        totalFlightHours: 120,
        yearsOfExperience: 2,
      },
      blacklistStatus: {
        isBlacklisted: false,
      },
      authorizedDroneTypes: ['commercial', 'recreational'],
    });

    const operator2 = await Operator.create({
      userId: users.find(u => u.email === 'operator2@dms.gov.pk')?._id,
      identityInfo: {
        cnic: '42101-2345678-9',
        dateOfBirth: new Date('1988-05-20'),
        address: 'Apartment 456, Block B',
        city: 'Islamabad',
        country: 'Pakistan',
      },
      trainingRecords: [
        {
          courseName: 'Professional Drone Pilot',
          institution: 'Pakistan Aviation Academy',
          completionDate: new Date('2022-03-10'),
          certificateNumber: 'CERT-003',
        },
      ],
      certifications: [
        {
          certificationType: 'Commercial Drone Pilot',
          issuedBy: 'CAA Pakistan',
          issueDate: new Date('2022-04-01'),
          expiryDate: new Date('2025-04-01'),
          certificateNumber: 'CDP-2022-045',
        },
      ],
      flightHistory: [
        {
          flightDate: new Date('2024-01-05'),
          droneModel: 'DJI Air 2S',
          location: 'Islamabad',
          duration: 30,
          purpose: 'Real Estate Photography',
        },
        {
          flightDate: new Date('2024-01-20'),
          droneModel: 'DJI Mini 3 Pro',
          location: 'Rawalpindi',
          duration: 25,
          purpose: 'Event Coverage',
        },
      ],
      experience: {
        totalFlights: 28,
        totalFlightHours: 85,
        yearsOfExperience: 3,
      },
      blacklistStatus: {
        isBlacklisted: false,
      },
      authorizedDroneTypes: ['commercial'],
    });

    // Create additional operators for more data
    const additionalOperators = [];
    const operatorUsers = users.filter(u => u.role === 'operator');
    for (let i = 2; i < operatorUsers.length; i++) {
      const operator = await Operator.create({
        userId: operatorUsers[i]._id,
        identityInfo: {
          cnic: `42101-${1000000 + i}-${i}`,
          dateOfBirth: new Date(1985 + i, i % 12, (i * 3) % 28),
          address: `Street ${i * 10}, Block ${i}`,
          city: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'][i % 4],
          country: 'Pakistan',
        },
        trainingRecords: [
          {
            courseName: 'Basic Drone Operation',
            institution: 'CAA Training Center',
            completionDate: new Date(2023, i % 12, 1),
            certificateNumber: `CERT-${100 + i}`,
          },
        ],
        certifications: [
          {
            certificationType: 'Commercial Drone Pilot',
            issuedBy: 'CAA Pakistan',
            issueDate: new Date(2023, (i + 1) % 12, 1),
            expiryDate: new Date(2026, (i + 1) % 12, 1),
            certificateNumber: `CDP-2023-${100 + i}`,
          },
        ],
        flightHistory: [],
        experience: {
          totalFlights: Math.floor(Math.random() * 50) + 10,
          totalFlightHours: Math.floor(Math.random() * 200) + 20,
          yearsOfExperience: Math.floor(Math.random() * 5) + 1,
        },
        blacklistStatus: {
          isBlacklisted: false,
        },
        authorizedDroneTypes: ['commercial', 'recreational'],
      });
      additionalOperators.push(operator);
    }

    console.log(`Created ${await Operator.countDocuments()} operators`);

    // Create licenses
    console.log('Creating licenses...');
    const licenses = [];
    
    // Individual licenses
    for (let i = 0; i < 10; i++) {
      const operator = i % 2 === 0 ? operator1 : operator2;
      const droneModel = droneModels[Math.floor(Math.random() * droneModels.length)];
      const manufacturer = droneModelMap.get(droneModel._id.toString()) || 'Unknown';
      const issueDate = new Date();
      issueDate.setMonth(issueDate.getMonth() - Math.floor(Math.random() * 12));
      const expiryDate = new Date(issueDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const license = await License.create({
        licenseType: 'individual',
        operatorId: operator._id,
        droneDetails: {
          model: droneModel.modelName,
          serialNumber: `${droneModel.serialNumberPrefix}-${Date.now()}-${i}`,
          manufacturer: manufacturer,
          weight: droneModel.specifications.weight,
          maxAltitude: droneModel.specifications.maxAltitude,
        },
        status: i < 7 ? 'approved' : 'pending',
        issueDate,
        expiryDate,
        approvedBy: i < 7 ? users.find(u => u.role === 'caa_officer')?._id : undefined,
        approvedAt: i < 7 ? issueDate : undefined,
      });
      licenses.push(license);
    }

    // Commercial licenses
    for (let i = 0; i < 8; i++) {
      const operator = i % 2 === 0 ? operator1 : operator2;
      const droneModel = droneModels[Math.floor(Math.random() * droneModels.length)];
      const issueDate = new Date();
      issueDate.setMonth(issueDate.getMonth() - Math.floor(Math.random() * 6));
      const expiryDate = new Date(issueDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);

      const license = await License.create({
        licenseType: 'commercial',
        operatorId: operator._id,
        droneDetails: {
          model: droneModel.modelName,
          serialNumber: `${droneModel.serialNumberPrefix}-COM-${Date.now()}-${i}`,
          manufacturer: droneModelMap.get(droneModel._id.toString()) || 'Unknown',
          weight: droneModel.specifications.weight,
          maxAltitude: droneModel.specifications.maxAltitude,
        },
        status: i < 6 ? 'approved' : 'pending',
        issueDate,
        expiryDate,
        approvedBy: i < 6 ? users.find(u => u.role === 'caa_officer')?._id : undefined,
        approvedAt: i < 6 ? issueDate : undefined,
      });
      licenses.push(license);
    }

    // Government licenses
    for (let i = 0; i < 5; i++) {
      const operator = operator1;
      const droneModel = droneModels.find(d => d.useCases.includes('government')) || droneModels[0];
      const manufacturer = droneModelMap.get(droneModel._id.toString()) || 'Unknown';
      const issueDate = new Date();
      issueDate.setMonth(issueDate.getMonth() - Math.floor(Math.random() * 3));
      const expiryDate = new Date(issueDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 3);

      const license = await License.create({
        licenseType: 'government',
        operatorId: operator._id,
        droneDetails: {
          model: droneModel.modelName,
          serialNumber: `${droneModel.serialNumberPrefix}-GOV-${Date.now()}-${i}`,
          manufacturer: manufacturer,
          weight: droneModel.specifications.weight,
          maxAltitude: droneModel.specifications.maxAltitude,
        },
        status: 'approved',
        issueDate,
        expiryDate,
        approvedBy: users.find(u => u.role === 'admin')?._id,
        approvedAt: issueDate,
      });
      licenses.push(license);
    }

    console.log(`Created ${licenses.length} licenses`);

    // Create flights
    console.log('Creating flights...');
    const flights = [];
    const approvedLicenses = licenses.filter(l => l.status === 'approved');
    const operator1User = users.find(u => u.email === 'operator1@dms.gov.pk');
    const operator2User = users.find(u => u.email === 'operator2@dms.gov.pk');
    const caaOfficer = users.find(u => u.role === 'caa_officer');
    const admin = users.find(u => u.role === 'admin');

    // Pakistan locations with coordinates
    const pakistanLocations = [
      { name: 'Karachi', lat: 24.8607, lng: 67.0011, address: 'Karachi, Sindh, Pakistan' },
      { name: 'Lahore', lat: 31.5204, lng: 74.3587, address: 'Lahore, Punjab, Pakistan' },
      { name: 'Islamabad', lat: 33.6844, lng: 73.0479, address: 'Islamabad, Capital Territory, Pakistan' },
      { name: 'Rawalpindi', lat: 33.5651, lng: 73.0169, address: 'Rawalpindi, Punjab, Pakistan' },
      { name: 'Faisalabad', lat: 31.4504, lng: 73.1350, address: 'Faisalabad, Punjab, Pakistan' },
      { name: 'Multan', lat: 30.1575, lng: 71.5249, address: 'Multan, Punjab, Pakistan' },
      { name: 'Peshawar', lat: 34.0151, lng: 71.5249, address: 'Peshawar, Khyber Pakhtunkhwa, Pakistan' },
      { name: 'Quetta', lat: 30.1798, lng: 66.9750, address: 'Quetta, Balochistan, Pakistan' },
      { name: 'Hyderabad', lat: 25.3960, lng: 68.3578, address: 'Hyderabad, Sindh, Pakistan' },
      { name: 'Gujranwala', lat: 32.1617, lng: 74.1883, address: 'Gujranwala, Punjab, Pakistan' },
    ];

    const flightPurposes = [
      'Aerial Photography',
      'Surveying',
      'Real Estate Photography',
      'Event Coverage',
      'Infrastructure Inspection',
      'Agricultural Monitoring',
      'Search and Rescue',
      'Traffic Monitoring',
      'Construction Site Survey',
      'Environmental Monitoring',
    ];

    // Create pending flights (need approval)
    for (let i = 0; i < 8; i++) {
      const license = approvedLicenses[Math.floor(Math.random() * approvedLicenses.length)];
      const operator = license.operatorId.toString() === operator1User?._id.toString() ? operator1User : operator2User;
      const location = pakistanLocations[Math.floor(Math.random() * pakistanLocations.length)];
      const purpose = flightPurposes[Math.floor(Math.random() * flightPurposes.length)];
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 30) + 1);
      const startHour = Math.floor(Math.random() * 8) + 8; // 8 AM to 4 PM
      const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      const duration = Math.floor(Math.random() * 60) + 15; // 15 to 75 minutes
      const endHour = startHour + Math.floor(duration / 60);
      const endMinute = (startMinute + (duration % 60)) % 60;

      const flight = await Flight.create({
        operatorId: operator?._id,
        licenseId: license._id,
        flightDetails: {
          purpose,
          scheduledDate,
          scheduledStartTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
          scheduledEndTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
          estimatedDuration: duration,
          maxAltitude: Math.floor(Math.random() * 200) + 50, // 50 to 250 meters
          flightArea: {
            center: {
              latitude: location.lat + (Math.random() - 0.5) * 0.1, // Add some variation
              longitude: location.lng + (Math.random() - 0.5) * 0.1,
            },
            radius: Math.floor(Math.random() * 500) + 100, // 100 to 600 meters
            address: location.address,
          },
          weatherConditions: ['Clear', 'Partly Cloudy', 'Sunny', 'Light Wind'][Math.floor(Math.random() * 4)],
          notes: `Flight scheduled for ${purpose.toLowerCase()} in ${location.name}`,
        },
        status: 'pending',
      });
      flights.push(flight);
    }

    // Create approved flights
    for (let i = 0; i < 6; i++) {
      const license = approvedLicenses[Math.floor(Math.random() * approvedLicenses.length)];
      const operator = license.operatorId.toString() === operator1._id.toString() ? operator1User : operator2User;
      const location = pakistanLocations[Math.floor(Math.random() * pakistanLocations.length)];
      const purpose = flightPurposes[Math.floor(Math.random() * flightPurposes.length)];
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 20) + 1);
      const startHour = Math.floor(Math.random() * 8) + 8;
      const startMinute = Math.floor(Math.random() * 4) * 15;
      const duration = Math.floor(Math.random() * 60) + 15;
      const endHour = startHour + Math.floor(duration / 60);
      const endMinute = (startMinute + (duration % 60)) % 60;
      const approvedAt = new Date();
      approvedAt.setDate(approvedAt.getDate() - Math.floor(Math.random() * 5));

      const flight = await Flight.create({
        operatorId: operator?._id,
        licenseId: license._id,
        flightDetails: {
          purpose,
          scheduledDate,
          scheduledStartTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
          scheduledEndTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
          estimatedDuration: duration,
          maxAltitude: Math.floor(Math.random() * 200) + 50,
          flightArea: {
            center: {
              latitude: location.lat + (Math.random() - 0.5) * 0.1,
              longitude: location.lng + (Math.random() - 0.5) * 0.1,
            },
            radius: Math.floor(Math.random() * 500) + 100,
            address: location.address,
          },
          weatherConditions: ['Clear', 'Partly Cloudy', 'Sunny'][Math.floor(Math.random() * 3)],
          notes: `Approved flight for ${purpose.toLowerCase()} in ${location.name}`,
        },
        status: 'approved',
        approvedBy: i % 2 === 0 ? caaOfficer?._id : admin?._id,
        approvedAt,
      });
      flights.push(flight);
    }

    // Create in_progress flights
    for (let i = 0; i < 2; i++) {
      const license = approvedLicenses[Math.floor(Math.random() * approvedLicenses.length)];
      const operator = license.operatorId.toString() === operator1._id.toString() ? operator1User : operator2User;
      const location = pakistanLocations[Math.floor(Math.random() * pakistanLocations.length)];
      const purpose = flightPurposes[Math.floor(Math.random() * flightPurposes.length)];
      const scheduledDate = new Date();
      const startHour = Math.floor(Math.random() * 8) + 8;
      const startMinute = Math.floor(Math.random() * 4) * 15;
      const duration = Math.floor(Math.random() * 60) + 15;
      const endHour = startHour + Math.floor(duration / 60);
      const endMinute = (startMinute + (duration % 60)) % 60;
      const approvedAt = new Date();
      approvedAt.setDate(approvedAt.getDate() - 1);
      const startTime = new Date();
      startTime.setHours(startHour, startMinute, 0, 0);

      const flight = await Flight.create({
        operatorId: operator?._id,
        licenseId: license._id,
        flightDetails: {
          purpose,
          scheduledDate,
          scheduledStartTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
          scheduledEndTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
          estimatedDuration: duration,
          maxAltitude: Math.floor(Math.random() * 200) + 50,
          flightArea: {
            center: {
              latitude: location.lat + (Math.random() - 0.5) * 0.1,
              longitude: location.lng + (Math.random() - 0.5) * 0.1,
            },
            radius: Math.floor(Math.random() * 500) + 100,
            address: location.address,
          },
          weatherConditions: 'Clear',
          notes: `Active flight for ${purpose.toLowerCase()} in ${location.name}`,
        },
        status: 'in_progress',
        approvedBy: caaOfficer?._id,
        approvedAt,
        actualFlightData: {
          startTime,
        },
      });
      flights.push(flight);
    }

    // Create completed flights
    for (let i = 0; i < 5; i++) {
      const license = approvedLicenses[Math.floor(Math.random() * approvedLicenses.length)];
      const operator = license.operatorId.toString() === operator1._id.toString() ? operator1User : operator2User;
      const location = pakistanLocations[Math.floor(Math.random() * pakistanLocations.length)];
      const purpose = flightPurposes[Math.floor(Math.random() * flightPurposes.length)];
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 30) - 1);
      const startHour = Math.floor(Math.random() * 8) + 8;
      const startMinute = Math.floor(Math.random() * 4) * 15;
      const duration = Math.floor(Math.random() * 60) + 15;
      const endHour = startHour + Math.floor(duration / 60);
      const endMinute = (startMinute + (duration % 60)) % 60;
      const approvedAt = new Date(scheduledDate);
      approvedAt.setDate(approvedAt.getDate() - 2);
      const startTime = new Date(scheduledDate);
      startTime.setHours(startHour, startMinute, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      const flight = await Flight.create({
        operatorId: operator?._id,
        licenseId: license._id,
        flightDetails: {
          purpose,
          scheduledDate,
          scheduledStartTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
          scheduledEndTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
          estimatedDuration: duration,
          maxAltitude: Math.floor(Math.random() * 200) + 50,
          flightArea: {
            center: {
              latitude: location.lat + (Math.random() - 0.5) * 0.1,
              longitude: location.lng + (Math.random() - 0.5) * 0.1,
            },
            radius: Math.floor(Math.random() * 500) + 100,
            address: location.address,
          },
          weatherConditions: ['Clear', 'Partly Cloudy'][Math.floor(Math.random() * 2)],
          notes: `Completed flight for ${purpose.toLowerCase()} in ${location.name}`,
        },
        status: 'completed',
        approvedBy: caaOfficer?._id,
        approvedAt,
        actualFlightData: {
          startTime,
          endTime,
          actualDuration: duration + Math.floor(Math.random() * 10) - 5, // ±5 minutes variation
          actualMaxAltitude: Math.floor(Math.random() * 200) + 50,
        },
      });
      flights.push(flight);
    }

    // Create rejected flights
    for (let i = 0; i < 3; i++) {
      const license = approvedLicenses[Math.floor(Math.random() * approvedLicenses.length)];
      const operator = license.operatorId.toString() === operator1._id.toString() ? operator1User : operator2User;
      const location = pakistanLocations[Math.floor(Math.random() * pakistanLocations.length)];
      const purpose = flightPurposes[Math.floor(Math.random() * flightPurposes.length)];
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 20) + 1);
      const startHour = Math.floor(Math.random() * 8) + 8;
      const startMinute = Math.floor(Math.random() * 4) * 15;
      const duration = Math.floor(Math.random() * 60) + 15;
      const endHour = startHour + Math.floor(duration / 60);
      const endMinute = (startMinute + (duration % 60)) % 60;
      const rejectedAt = new Date();
      rejectedAt.setDate(rejectedAt.getDate() - Math.floor(Math.random() * 5));
      const rejectionReasons = [
        'Flight area too close to restricted zone',
        'Insufficient documentation',
        'Weather conditions not suitable',
        'Altitude exceeds license limitations',
        'Flight purpose not aligned with license type',
      ];

      const flight = await Flight.create({
        operatorId: operator?._id,
        licenseId: license._id,
        flightDetails: {
          purpose,
          scheduledDate,
          scheduledStartTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
          scheduledEndTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
          estimatedDuration: duration,
          maxAltitude: Math.floor(Math.random() * 200) + 50,
          flightArea: {
            center: {
              latitude: location.lat + (Math.random() - 0.5) * 0.1,
              longitude: location.lng + (Math.random() - 0.5) * 0.1,
            },
            radius: Math.floor(Math.random() * 500) + 100,
            address: location.address,
          },
          weatherConditions: 'Partly Cloudy',
          notes: `Rejected flight request for ${purpose.toLowerCase()} in ${location.name}`,
        },
        status: 'rejected',
        rejectedBy: i % 2 === 0 ? caaOfficer?._id : admin?._id,
        rejectedAt,
        rejectionReason: rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)],
      });
      flights.push(flight);
    }

    console.log(`Created ${flights.length} flights`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Email: admin@dms.gov.pk | Password: password123');
    console.log('Email: caa.officer@dms.gov.pk | Password: password123');
    console.log('Email: operator1@dms.gov.pk | Password: password123');
    console.log('Email: vendor1@dms.gov.pk | Password: password123');
    console.log('\nAll users have verified emails and can login directly.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

