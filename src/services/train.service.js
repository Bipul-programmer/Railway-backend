import Train from '../models/Train.model.js';
import Station from '../models/Station.model.js';
import rapidapiService from './rapidapi.service.js';

class TrainService {
  
  /**
   * Search trains between source and destination stations
   */
  async searchTrains(fromStation, toStation, date) {
    try {
      // Normalize inputs (trim and uppercase)
      const from = fromStation.trim().toUpperCase();
      const to = toStation.trim().toUpperCase();
      
      // Let's first search external/mock data
      const trains = await rapidapiService.searchTrains(from, to, date);

      // Try to find if stations exist in our database to enhance metadata
      const [srcStation, destStation] = await Promise.all([
        Station.findOne({ code: from }),
        Station.findOne({ code: to })
      ]);

      // If found in local db, enrich the response stations
      const enrichedTrains = trains.map(t => ({
        ...t,
        fromName: srcStation ? srcStation.name : t.from,
        toName: destStation ? destStation.name : t.to,
      }));

      return enrichedTrains;
    } catch (error) {
      console.error(`❌ Error in TrainService.searchTrains: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search trains by query (number or name) in local DB and mock lists
   */
  async searchTrainsByQuery(query) {
    try {
      const regex = new RegExp(query, 'i');
      
      // Search local database
      const dbTrains = await Train.find({
        $or: [
          { trainNumber: regex },
          { name: regex }
        ]
      });

      // Format dbTrains to match the search output expected by the client
      let formattedDbTrains = dbTrains.map(t => ({
        id: t.trainNumber,
        trainNumber: t.trainNumber,
        trainName: t.name,
        name: t.name,
        from: t.sourceStation?.code || 'NDLS',
        to: t.destinationStation?.code || 'DBRG',
        dep: t.route[0]?.departureTime || '16:20',
        arr: t.route[t.route.length - 1]?.arrivalTime || '14:00',
        duration: '12h 00m',
        days: 'Daily',
        type: t.type || 'Express',
        avail: 45,
        delay: 0
      }));

      // Fallback/combine with mock trains if nothing matches
      const mockTrainsList = [
        { id: '12424', trainNumber: '12424', trainName: 'NDLS DBRG RAJDHANI EXP', name: 'NDLS DBRG RAJDHANI EXP', from: 'NDLS', to: 'DBRG', dep: '16:20', arr: '14:00', duration: '21h 40m', days: 'Daily', type: 'Rajdhani', avail: 18, delay: 0 },
        { id: '12002', trainNumber: '12002', trainName: 'NDLS HBJ SHATABDI EXP',  name: 'NDLS HBJ SHATABDI EXP',  from: 'NDLS', to: 'HBJ',  dep: '06:00', arr: '14:20', duration: '8h 20m',  days: 'Daily', type: 'Shatabdi', avail: 0, delay: 0 },
        { id: '22415', trainNumber: '22415', trainName: 'VANDE BHARAT EXPRESS',   name: 'VANDE BHARAT EXPRESS',   from: 'NDLS', to: 'LKO',  dep: '06:00', arr: '14:00', duration: '8h 00m',  days: 'MTuWThFSaSu', type: 'Vande Bharat', avail: 5, delay: 12 },
        { id: '12301', trainNumber: '12301', trainName: 'HOWRAH RAJDHANI EXP',    name: 'HOWRAH RAJDHANI EXP',    from: 'NDLS', to: 'HWH',  dep: '16:55', arr: '10:05', duration: '17h 10m', days: 'Daily', type: 'Rajdhani', avail: 31, delay: 0 },
      ];

      const matchingMockTrains = mockTrainsList.filter(t => 
        t.trainNumber.includes(query) || t.trainName.toLowerCase().includes(query.toLowerCase())
      );

      // Combine and de-duplicate
      const combined = [...formattedDbTrains];
      matchingMockTrains.forEach(m => {
        if (!combined.some(c => c.trainNumber === m.trainNumber)) {
          combined.push(m);
        }
      });

      return combined;
    } catch (error) {
      console.error(`❌ Error in TrainService.searchTrainsByQuery: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Live Location and Status of a Train
   */
  async getLiveStatus(trainNumber) {
    try {
      const liveStatus = await rapidapiService.getLiveTrainStatus(trainNumber);
      return liveStatus;
    } catch (error) {
      console.error(`❌ Error in TrainService.getLiveStatus: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Live Station Status (arrivals/departures within window)
   */
  async getLiveStationStatus(stationCode, hours = 2) {
    try {
      const code = stationCode.trim().toUpperCase();
      const liveStation = await rapidapiService.getLiveStation(code, hours);
      return liveStation;
    } catch (error) {
      console.error(`❌ Error in TrainService.getLiveStationStatus: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Train Schedule and Route
   */
  async getTrainSchedule(trainNumber) {
    try {
      // Try local DB first
      let train = await Train.findOne({ trainNumber });
      
      if (train) {
        return {
          trainNumber: train.trainNumber,
          name: train.name,
          class: train.classes,
          runsOn: train.runsOn,
          route: train.route
        };
      }

      // If not in local DB, fetch via RapidAPI/Mock
      const schedule = await rapidapiService.getTrainSchedule(trainNumber);

      // Save to local database asynchronously so next time it is cached
      try {
        await Train.create({
          trainNumber: schedule.trainNumber,
          name: schedule.name,
          type: trainNumber.startsWith('120') ? 'Shatabdi' : trainNumber.startsWith('124') ? 'Rajdhani' : 'Express',
          sourceStation: {
            code: schedule.route[0]?.stationCode || '',
            name: schedule.route[0]?.stationName || '',
          },
          destinationStation: {
            code: schedule.route[schedule.route.length - 1]?.stationCode || '',
            name: schedule.route[schedule.route.length - 1]?.stationName || '',
          },
          classes: schedule.class || ['1A', '2A', '3A', 'SL'],
          runsOn: schedule.runsOn,
          route: schedule.route.map(r => ({
            stationCode: r.stationCode,
            stationName: r.stationName,
            arrivalTime: r.arrivalTime,
            departureTime: r.departureTime,
            distance: r.distance,
            day: r.day
          }))
        });
        console.log(`💾 Cached train ${trainNumber} schedule to MongoDB`);
      } catch (saveErr) {
        // Ignore duplicate key errors if already created in parallel
        if (saveErr.code !== 11000) {
          console.warn(`⚠️ Failed to cache train schedule to local DB: ${saveErr.message}`);
        }
      }

      return schedule;
    } catch (error) {
      console.error(`❌ Error in TrainService.getTrainSchedule: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check seat availability
   */
  async getSeatAvailability(trainNumber, from, to, date, classCode) {
    try {
      const availability = await rapidapiService.checkSeatAvailability(
        trainNumber, 
        from.toUpperCase(), 
        to.toUpperCase(), 
        date, 
        classCode
      );
      return availability;
    } catch (error) {
      console.error(`❌ Error in TrainService.getSeatAvailability: ${error.message}`);
      throw error;
    }
  }

  /**
   * Seed stations and trains if empty
   */
  async seedStationsAndTrains() {
    try {
      const stationCount = await Station.countDocuments();
      if (stationCount === 0) {
        const sampleStations = [
          { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi', coordinates: { latitude: 28.6139, longitude: 77.209 } },
          { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', coordinates: { latitude: 26.4499, longitude: 80.3319 } },
          { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh', coordinates: { latitude: 26.8467, longitude: 80.9462 } },
          { code: 'BSB', name: 'Varanasi Jn', city: 'Varanasi', state: 'Uttar Pradesh', coordinates: { latitude: 25.3176, longitude: 82.9739 } },
          { code: 'PNBE', name: 'Patna Jn', city: 'Patna', state: 'Bihar', coordinates: { latitude: 25.5941, longitude: 85.1376 } },
          { code: 'DBRG', name: 'Dibrugarh', city: 'Dibrugarh', state: 'Assam', coordinates: { latitude: 27.4728, longitude: 95.017 } },
          { code: 'HBJ', name: 'Habibganj', city: 'Bhopal', state: 'Madhya Pradesh', coordinates: { latitude: 23.2198, longitude: 77.4369 } },
          { code: 'BPL', name: 'Bhopal Jn', city: 'Bhopal', state: 'Madhya Pradesh', coordinates: { latitude: 23.2599, longitude: 77.4126 } },
        ];
        await Station.insertMany(sampleStations);
        console.log(`🌱 Seeded ${sampleStations.length} stations in DB`);
      }
    } catch (error) {
      console.error(`❌ Failed to seed database: ${error.message}`);
    }
  }
}

export default new TrainService();
