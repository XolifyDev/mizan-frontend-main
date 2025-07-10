// Test script for iqamah timing system
const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@6.5.0_prisma@6.5.0_typescript@5.8.2__typescript@5.8.2/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function testIqamahSystem() {
  try {
    console.log('Testing Iqamah Timing System...\n');

    // 1. Test getting iqamah timing for a specific date
    const testDate = new Date('2024-01-15');
    const testMasjidId = 'test-masjid-id'; // Replace with actual masjid ID

    console.log('1. Testing getIqamahTimingForDate...');
    const iqamahTiming = await prisma.iqamahTiming.findMany({
      where: { 
        masjidId: testMasjidId, 
        changeDate: { lte: testDate } 
      },
      orderBy: { changeDate: "desc" },
      take: 1,
    });
    
    console.log('Iqamah timing for', testDate.toDateString(), ':', iqamahTiming[0] || 'None found');

    // 2. Test getting today's prayer times with iqamah
    console.log('\n2. Testing today\'s prayer times...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayPrayerTimes = await prisma.prayerTime.findFirst({
      where: {
        masjidId: testMasjidId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    console.log('Today\'s prayer times:', todayPrayerTimes || 'None found');

    // 3. Test getting iqamah timing schedule for a date range
    console.log('\n3. Testing iqamah timing schedule...');
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    const schedule = await prisma.iqamahTiming.findMany({
      where: {
        masjidId: testMasjidId,
        changeDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        changeDate: "asc",
      },
    });
    
    console.log('Iqamah schedule for January 2024:', schedule.length, 'entries found');

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIqamahSystem(); 