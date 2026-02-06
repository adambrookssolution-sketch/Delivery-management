const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@delivery.com' },
    update: {},
    create: {
      email: 'admin@delivery.com',
      password: adminPassword,
      name: 'System Admin',
      phone: '+1234567890',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create dispatcher user
  const dispatcherPassword = await bcrypt.hash('dispatcher123', 10);
  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@delivery.com' },
    update: {},
    create: {
      email: 'dispatcher@delivery.com',
      password: dispatcherPassword,
      name: 'Main Dispatcher',
      phone: '+1234567891',
      role: 'DISPATCHER',
      isActive: true,
    },
  });
  console.log('✅ Dispatcher user created:', dispatcher.email);

  // Create test driver users
  const driverPassword = await bcrypt.hash('driver123', 10);
  const driver1 = await prisma.user.upsert({
    where: { email: 'driver1@delivery.com' },
    update: {},
    create: {
      email: 'driver1@delivery.com',
      password: driverPassword,
      name: 'John Driver',
      phone: '+1234567892',
      role: 'DRIVER',
      isActive: true,
    },
  });
  console.log('✅ Driver 1 created:', driver1.email);

  const driver2 = await prisma.user.upsert({
    where: { email: 'driver2@delivery.com' },
    update: {},
    create: {
      email: 'driver2@delivery.com',
      password: driverPassword,
      name: 'Jane Driver',
      phone: '+1234567893',
      role: 'DRIVER',
      isActive: true,
    },
  });
  console.log('✅ Driver 2 created:', driver2.email);

  // Create sample shipments
  const shipment1 = await prisma.shipment.create({
    data: {
      trackingNumber: 'PKG-20260204-TEST1',
      status: 'PENDING',
      senderName: 'ABC Company',
      senderPhone: '+1111111111',
      senderAddress: '123 Business St, New York, NY 10001',
      recipientName: 'John Doe',
      recipientPhone: '+2222222222',
      recipientAddress: '456 Home Ave, Brooklyn, NY 11201',
      recipientLat: 40.6892,
      recipientLng: -73.9442,
      packageWeight: 2.5,
      packageSize: 'MEDIUM',
      description: 'Electronics package',
      deliveryCode: '123456',
      createdById: admin.id,
    },
  });

  // Add status history
  await prisma.statusHistory.create({
    data: {
      shipmentId: shipment1.id,
      status: 'PENDING',
      note: 'Shipment created',
      location: 'Warehouse A',
    },
  });
  console.log('✅ Sample shipment created:', shipment1.trackingNumber);

  const shipment2 = await prisma.shipment.create({
    data: {
      trackingNumber: 'PKG-20260204-TEST2',
      status: 'IN_TRANSIT',
      senderName: 'XYZ Store',
      senderPhone: '+3333333333',
      senderAddress: '789 Shop Blvd, Manhattan, NY 10002',
      recipientName: 'Jane Smith',
      recipientPhone: '+4444444444',
      recipientAddress: '321 Apartment Rd, Queens, NY 11101',
      recipientLat: 40.7282,
      recipientLng: -73.7949,
      packageWeight: 1.0,
      packageSize: 'SMALL',
      description: 'Clothing items',
      deliveryCode: '654321',
      createdById: admin.id,
      driverId: driver1.id,
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        shipmentId: shipment2.id,
        status: 'PENDING',
        note: 'Shipment created',
        location: 'Warehouse B',
      },
      {
        shipmentId: shipment2.id,
        status: 'PICKED_UP',
        note: 'Package picked up by driver',
        location: 'Warehouse B',
      },
      {
        shipmentId: shipment2.id,
        status: 'IN_TRANSIT',
        note: 'Package in transit',
        location: 'Distribution Center',
      },
    ],
  });
  console.log('✅ Sample shipment 2 created:', shipment2.trackingNumber);

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📝 Test accounts:');
  console.log('   Admin: admin@delivery.com / admin123');
  console.log('   Dispatcher: dispatcher@delivery.com / dispatcher123');
  console.log('   Driver 1: driver1@delivery.com / driver123');
  console.log('   Driver 2: driver2@delivery.com / driver123');
  console.log('');
  console.log('📦 Sample tracking numbers:');
  console.log('   PKG-20260204-TEST1 (PENDING)');
  console.log('   PKG-20260204-TEST2 (IN_TRANSIT)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
