# Iqamah Timing System

## Overview

The iqamah timing system allows masjids to set different iqamah times that automatically take effect on specified dates. This is useful for seasonal changes, Ramadan, or any other period where iqamah times need to be adjusted.

## How It Works

### 1. Dynamic Iqamah Timing Selection

The system automatically selects the most recent iqamah timing whose `changeDate` is **on or before** the target date. This means:

- If you set an iqamah timing for January 1st, it will be used for all dates from January 1st onwards
- If you set another iqamah timing for March 1st, it will be used for all dates from March 1st onwards
- The system always uses the most recent timing that has already taken effect

### 2. Database Schema

#### IqamahTiming Model
```prisma
model IqamahTiming {
  id            String   @id @default(cuid())
  masjidId      String
  changeDate    DateTime  // When this timing takes effect
  fajr          String
  dhuhr         String
  asr           String
  maghrib       String
  maghribType   String    // "Fixed" or "Offset"
  maghribOffset String
  isha          String
  jumuahI       String?
  jumuahII      String?
  jumuahIII     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  masjid        Masjid    @relation(fields: [masjidId], references: [id], onDelete: Cascade)
}
```

#### PrayerTime Model (Updated)
```prisma
model PrayerTime {
  // ... existing fields ...
  
  // Iqamah timing fields
  iqamahFajr      DateTime?
  iqamahDhuhr     DateTime?
  iqamahAsr       DateTime?
  iqamahMaghrib   DateTime?
  iqamahIsha      DateTime?
  iqamahJumuahI   DateTime?
  iqamahJumuahII  DateTime?
  iqamahJumuahIII DateTime?
}
```

### 3. Key Functions

#### `getIqamahTimingForDate(masjidId, date)`
Returns the most recent iqamah timing for a given masjid and date.

#### `getTodayIqamahTiming(masjidId)`
Returns today's iqamah timing for a masjid.

#### `bulkCreateIqamahTimings(masjidId, startDate, endDate, iqamahData)`
Creates an iqamah timing for a date range, useful for setting up seasonal timings.

#### `generateMonthlyPrayerTimes()`
Updated to include iqamah timings for each day when generating prayer times.

### 4. Usage Examples

#### Setting Up Ramadan Iqamah Times
```javascript
// Set Ramadan iqamah times (March 10 - April 9, 2024)
await bulkCreateIqamahTimings(
  masjidId,
  new Date('2024-03-10'),
  new Date('2024-04-09'),
  {
    fajr: "05:30",
    dhuhr: "12:45",
    asr: "16:00",
    maghrib: "19:15",
    maghribType: "Fixed",
    maghribOffset: "0",
    isha: "20:30",
    jumuahI: "12:30",
    jumuahII: "13:30",
    jumuahIII: "14:30"
  }
);
```

#### Getting Today's Iqamah Times
```javascript
const todayIqamah = await getTodayIqamahTiming(masjidId);
console.log('Today\'s Fajr iqamah:', todayIqamah?.fajr);
```

### 5. Frontend Integration

#### Prayer Times Display
The prayer times slide and bottom panel automatically display the correct iqamah times for the current date.

#### Bulk Creation UI
The dashboard includes a "Bulk Create" button that allows admins to set iqamah times for date ranges.

### 6. API Endpoints

#### GET `/api/masjids/[id]/prayer-times`
Returns today's prayer times with the correct iqamah timings.

### 7. Migration Notes

- The system automatically assigns iqamah timings when generating monthly prayer times
- Existing prayer times without iqamah data will show no iqamah times
- The system is backward compatible with existing prayer time data

## Benefits

1. **Automatic Date-Based Changes**: Iqamah times automatically change on specified dates
2. **Seasonal Management**: Easy to set up different timings for different seasons
3. **Ramadan Support**: Special iqamah times for Ramadan can be set in advance
4. **Bulk Operations**: Set iqamah times for entire months or seasons at once
5. **Real-time Display**: The signage app automatically shows the correct iqamah times

## Best Practices

1. **Plan Ahead**: Set up iqamah timings well in advance of change dates
2. **Use Bulk Creation**: For seasonal changes, use the bulk creation feature
3. **Test Changes**: Always test new iqamah timings before they take effect
4. **Document Changes**: Keep records of when iqamah times change and why 