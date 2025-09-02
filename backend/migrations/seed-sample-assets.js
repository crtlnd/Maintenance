// backend/migrations/seed-sample-assets.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Asset = require('../models/asset');
const User = require('../models/user');

const sampleAssets = [
  {
    id: 1,
    name: "Caterpillar 320D Excavator",
    type: "excavator",
    manufacturer: "Caterpillar",
    model: "320D",
    serialNumber: "CAT320D001",
    yearManufactured: 2020,
    location: "Houston Main Yard",
    organization: "Construction Corp",
    status: "operational",
    condition: "good",
    operatingHours: 2450,
    lastServiceDate: new Date('2024-08-15'),
    nextServiceDate: new Date('2025-02-15'),
    specifications: {
      engine: {
        power: "122 kW (164 hp)",
        displacement: "4.4 L",
        fuelType: "Diesel",
        fuelCapacity: "400 L"
      },
      hydraulics: {
        systemPressure: "35 MPa (350 bar)",
        pumpFlow: "240 L/min",
        tankCapacity: "200 L"
      },
      dimensions: {
        length: "9.4 m",
        width: "2.8 m",
        height: "3.1 m",
        weight: "20,500 kg"
      },
      performance: {
        maxSpeed: "38 km/h",
        liftCapacity: "8,500 kg",
        operatingWeight: "20,500 kg"
      }
    },
    maintenanceTasks: [
      {
        id: "task1",
        title: "Engine Oil Change",
        description: "Replace engine oil and filter",
        type: "preventive",
        priority: "medium",
        status: "pending",
        assignedTo: "Mike Johnson",
        estimatedHours: 2,
        dueDate: new Date('2025-09-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "task2",
        title: "Hydraulic System Inspection",
        description: "Check hydraulic fluid levels and inspect hoses",
        type: "inspection",
        priority: "high",
        status: "in-progress",
        assignedTo: "Sarah Williams",
        estimatedHours: 3,
        dueDate: new Date('2025-09-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    purchasePrice: 285000,
    purchaseDate: new Date('2020-03-15'),
    currentLocation: {
      address: "1234 Industrial Blvd, Houston, TX 77001",
      coordinates: {
        latitude: 29.7604,
        longitude: -95.3698
      }
    }
  },
  {
    id: 2,
    name: "John Deere 724K Wheel Loader",
    type: "loader",
    manufacturer: "John Deere",
    model: "724K",
    serialNumber: "JD724K002",
    yearManufactured: 2019,
    location: "North Construction Site",
    organization: "Construction Corp",
    status: "maintenance",
    condition: "fair",
    operatingHours: 3200,
    lastServiceDate: new Date('2024-07-20'),
    nextServiceDate: new Date('2025-01-20'),
    specifications: {
      engine: {
        power: "200 kW (268 hp)",
        displacement: "6.8 L",
        fuelType: "Diesel",
        fuelCapacity: "280 L"
      },
      dimensions: {
        length: "8.2 m",
        width: "2.6 m",
        height: "3.4 m",
        weight: "16,800 kg"
      },
      performance: {
        maxSpeed: "40 km/h",
        liftCapacity: "12,000 kg",
        operatingWeight: "16,800 kg"
      }
    },
    maintenanceTasks: [
      {
        id: "task3",
        title: "Transmission Service",
        description: "Service transmission and replace filters",
        type: "preventive",
        priority: "high",
        status: "overdue",
        assignedTo: "Tom Davis",
        estimatedHours: 4,
        dueDate: new Date('2025-08-25'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    purchasePrice: 195000,
    purchaseDate: new Date('2019-06-10'),
    currentLocation: {
      address: "5678 Construction Ave, Houston, TX 77002",
      coordinates: {
        latitude: 29.7749,
        longitude: -95.3890
      }
    }
  },
  {
    id: 3,
    name: "Caterpillar C18 Generator",
    type: "generator",
    manufacturer: "Caterpillar",
    model: "C18",
    serialNumber: "CATC18003",
    yearManufactured: 2021,
    location: "Emergency Power Station",
    organization: "Construction Corp",
    status: "operational",
    condition: "excellent",
    operatingHours: 850,
    lastServiceDate: new Date('2024-06-10'),
    nextServiceDate: new Date('2024-12-10'),
    specifications: {
      engine: {
        power: "600 kW (805 hp)",
        displacement: "18.1 L",
        fuelType: "Diesel",
        fuelCapacity: "1200 L"
      },
      performance: {
        powerOutput: "600 kW",
        voltage: "480V",
        frequency: "60 Hz",
        fuelConsumption: "120 L/hr"
      }
    },
    maintenanceTasks: [
      {
        id: "task4",
        title: "Load Bank Testing",
        description: "Perform monthly load bank test",
        type: "preventive",
        priority: "medium",
        status: "pending",
        assignedTo: "Alex Martinez",
        estimatedHours: 2,
        dueDate: new Date('2025-09-30'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    purchasePrice: 125000,
    purchaseDate: new Date('2021-01-15'),
    currentLocation: {
      address: "9876 Power Plant Rd, Houston, TX 77003",
      coordinates: {
        latitude: 29.7230,
        longitude: -95.2870
      }
    }
  },
  {
    id: 4,
    name: "Volvo FH16 Dump Truck",
    type: "truck",
    manufacturer: "Volvo",
    model: "FH16",
    serialNumber: "VOLVOFH004",
    yearManufactured: 2022,
    location: "Fleet Depot",
    organization: "Construction Corp",
    status: "operational",
    condition: "excellent",
    operatingHours: 1200,
    mileage: 45000,
    lastServiceDate: new Date('2024-08-01'),
    nextServiceDate: new Date('2025-02-01'),
    specifications: {
      engine: {
        power: "540 kW (724 hp)",
        displacement: "16.1 L",
        fuelType: "Diesel",
        fuelCapacity: "600 L"
      },
      dimensions: {
        length: "8.5 m",
        width: "2.5 m",
        height: "3.2 m",
        weight: "18,000 kg"
      },
      performance: {
        maxSpeed: "90 km/h",
        payloadCapacity: "25,000 kg",
        operatingWeight: "18,000 kg"
      }
    },
    maintenanceTasks: [
      {
        id: "task5",
        title: "Brake System Inspection",
        description: "Inspect brake pads and fluid levels",
        type: "inspection",
        priority: "high",
        status: "pending",
        assignedTo: "Lisa Chen",
        estimatedHours: 1.5,
        dueDate: new Date('2025-09-20'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    purchasePrice: 165000,
    purchaseDate: new Date('2022-04-20'),
    currentLocation: {
      address: "4321 Fleet St, Houston, TX 77004",
      coordinates: {
        latitude: 29.6884,
        longitude: -95.2103
      }
    }
  }
];

async function seedAssets() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/maintenance');
    console.log('Connected to MongoDB');

    // Get a user to assign assets to (use the first user with Basic plan)
    const user = await User.findOne({ subscriptionTier: 'Basic' });
    if (!user) {
      console.log('No user found. Please create a user first.');
      return;
    }

    console.log(`Found user: ${user.email} (ID: ${user.id})`);

    // Clear existing assets for this user
    await Asset.deleteMany({ userId: user.id });
    console.log('Cleared existing assets for user');

    // Add userId to sample assets
    const assetsWithUser = sampleAssets.map(asset => ({
      ...asset,
      userId: user.id
    }));

    // Insert sample assets
    const insertedAssets = await Asset.insertMany(assetsWithUser);
    console.log(`Inserted ${insertedAssets.length} sample assets`);

    // Update user's asset count and asset references
    await User.updateOne(
      { id: user.id },
      {
        assetCount: insertedAssets.length,
        assets: insertedAssets.map(asset => asset._id)
      }
    );

    console.log('Updated user asset count');
    console.log('Sample data seeded successfully!');

    // Display summary
    console.log('\n=== SEEDED ASSETS ===');
    insertedAssets.forEach(asset => {
      console.log(`${asset.id}: ${asset.name} (${asset.manufacturer} ${asset.model})`);
      console.log(`   Status: ${asset.status} | Condition: ${asset.condition} | Hours: ${asset.operatingHours}`);
      console.log(`   Tasks: ${asset.maintenanceTasks.length} maintenance tasks`);
      console.log('');
    });

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  seedAssets();
}

module.exports = { seedAssets, sampleAssets };
