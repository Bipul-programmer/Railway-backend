import axios from 'axios';

const API_KEY = process.env.RAILWAY_API_KEY;
const API_HOST = process.env.RAILWAY_API_HOST || 'irctc1.p.rapidapi.com';

const isApiKeyValid = API_KEY && API_KEY !== 'your_rapidapi_key_placeholder';

const apiClient = axios.create({
  baseURL: `https://${API_HOST}`,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': API_HOST,
  },
  timeout: 10000,
});

/**
 * RapidAPI Integration Service with Rich Mock Fallbacks
 */
class RapidApiService {
  
  /**
   * Helper to determine if we should use mock data
   */
  shouldUseMock() {
    return !isApiKeyValid;
  }

  /**
   * Fetch PNR Status
   * Endpoint: /api/v3/getPNRStatus
   */
  async getPNRStatus(pnrNumber) {
    if (this.shouldUseMock()) {
      console.log(`⚠️ Using mock data for PNR ${pnrNumber} (RapidAPI Key not configured)`);
      return this.generateMockPNR(pnrNumber);
    }

    try {
      const response = await apiClient.get('/api/v3/getPNRStatus', {
        params: { pnrNumber }
      });
      if (response.data && response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch PNR status from API');
    } catch (error) {
      console.error(`❌ RapidAPI PNR status error: ${error.message}. Falling back to mock.`);
      return this.generateMockPNR(pnrNumber);
    }
  }

  /**
   * Fetch Live Train Status
   * Endpoint: /api/v1/liveTrainStatus
   */
  async getLiveTrainStatus(trainNumber, startDay = 1) {
    if (this.shouldUseMock()) {
      console.log(`⚠️ Using mock data for Live Status of Train ${trainNumber}`);
      return this.generateMockLiveStatus(trainNumber);
    }

    try {
      const response = await apiClient.get('/api/v1/liveTrainStatus', {
        params: { trainNo: trainNumber, startDay }
      });
      if (response.data && response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch Live Train Status');
    } catch (error) {
      console.error(`❌ RapidAPI Live Train Status error: ${error.message}. Falling back to mock.`);
      return this.generateMockLiveStatus(trainNumber);
    }
  }

  /**
   * Fetch Train Schedule / Route
   * Endpoint: /api/v1/getRoute
   */
  async getTrainSchedule(trainNumber) {
    if (this.shouldUseMock()) {
      console.log(`⚠️ Using mock data for Schedule of Train ${trainNumber}`);
      return this.generateMockSchedule(trainNumber);
    }

    try {
      const response = await apiClient.get('/api/v1/getRoute', {
        params: { trainNo: trainNumber }
      });
      if (response.data && response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch train schedule');
    } catch (error) {
      console.error(`❌ RapidAPI Train Schedule error: ${error.message}. Falling back to mock.`);
      return this.generateMockSchedule(trainNumber);
    }
  }

  /**
   * Search Trains between stations
   * Endpoint: /api/v2/searchTrain
   */
  async searchTrains(fromStationCode, toStationCode, dateOfJourney) {
    if (this.shouldUseMock()) {
      console.log(`⚠️ Using mock data for Train Search: ${fromStationCode} ➔ ${toStationCode}`);
      return this.generateMockSearchTrains(fromStationCode, toStationCode);
    }

    try {
      const response = await apiClient.get('/api/v2/searchTrain', {
        params: { 
          srcStationCode: fromStationCode, 
          dstStationCode: toStationCode,
          dateOfJourney
        }
      });
      if (response.data && response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to search trains');
    } catch (error) {
      console.error(`❌ RapidAPI Train Search error: ${error.message}. Falling back to mock.`);
      return this.generateMockSearchTrains(fromStationCode, toStationCode);
    }
  }

  /**
   * Check Seat Availability
   * Endpoint: /api/v1/checkSeatAvailability
   */
  async checkSeatAvailability(trainNumber, fromStationCode, toStationCode, date, classCode, quota = 'GN') {
    if (this.shouldUseMock()) {
      console.log(`⚠️ Using mock data for Seat Availability: Train ${trainNumber}, ${classCode}`);
      return this.generateMockSeatAvailability(trainNumber, fromStationCode, toStationCode, classCode);
    }

    try {
      const response = await apiClient.get('/api/v1/checkSeatAvailability', {
        params: {
          class: classCode,
          date,
          dest: toStationCode,
          src: fromStationCode,
          quota,
          trainNo: trainNumber
        }
      });
      if (response.data && response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to check seat availability');
    } catch (error) {
      console.error(`❌ RapidAPI Seat Availability error: ${error.message}. Falling back to mock.`);
      return this.generateMockSeatAvailability(trainNumber, fromStationCode, toStationCode, classCode);
    }
  }

  /**
   * Fetch Live Station Status
   * Endpoint: /api/v3/getLiveStation
   */
  async getLiveStation(stationCode, hours = 2) {
    if (this.shouldUseMock()) {
      console.log(`⚠️ Using mock data for Live Station ${stationCode} (hours: ${hours})`);
      return this.generateMockLiveStation(stationCode, hours);
    }

    try {
      const response = await apiClient.get('/api/v3/getLiveStation', {
        params: { fromStationCode: stationCode, hours }
      });
      if (response.data && response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch live station status');
    } catch (error) {
      console.error(`❌ RapidAPI Live Station error: ${error.message}. Falling back to mock.`);
      return this.generateMockLiveStation(stationCode, hours);
    }
  }

  // ── MOCK DATA GENERATORS ──

  generateMockPNR(pnrNumber) {
    return {
      pnr: pnrNumber,
      trainNumber: '12002',
      trainName: 'NDLS HBJ SHATABDI EXPRESS',
      dateOfJourney: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sourceStation: { code: 'NDLS', name: 'New Delhi (NDLS)' },
      destinationStation: { code: 'HBJ', name: 'Habibganj (HBJ)' },
      className: '2A',
      chartStatus: 'CHART PREPARED',
      passengers: [
        { name: 'Bipul Kumar', age: 24, gender: 'M', bookingStatus: 'CNF/B2/24', currentStatus: 'CNF/B2/24', coach: 'B2', berth: 24 },
        { name: 'Anjali Singh', age: 22, gender: 'F', bookingStatus: 'CNF/B2/25', currentStatus: 'CNF/B2/25', coach: 'B2', berth: 25 },
      ],
      lastUpdated: new Date()
    };
  }

  generateMockLiveStatus(trainNumber) {
    const route = [
      { station: 'New Delhi (NDLS)', code: 'NDLS', arrival: '--', departure: '16:20', status: 'Departed', dist: '0 km' },
      { station: 'Kanpur Central (CNB)', code: 'CNB', arrival: '21:40', departure: '21:45', status: 'Departed', dist: '440 km' },
      { station: 'Lucknow NR (LKO)', code: 'LKO', arrival: '23:05', departure: '23:15', status: 'Current', dist: '512 km' },
      { station: 'Varanasi Jn (BSB)', code: 'BSB', arrival: '04:30', departure: '04:40', status: 'Upcoming', dist: '765 km' },
      { station: 'Patna Jn (PNBE)', code: 'PNBE', arrival: '08:15', departure: '08:20', status: 'Upcoming', dist: '1,006 km' },
      { station: 'Dibrugarh (DBRG)', code: 'DBRG', arrival: '14:00', departure: '--', status: 'Upcoming', dist: '1,957 km' },
    ];

    return {
      trainNumber,
      trainName: trainNumber === '12424' ? 'NDLS DBRG RAJDHANI EXP' : 'EXPRESS TRAIN',
      source: 'New Delhi (NDLS)',
      destination: 'Dibrugarh (DBRG)',
      currentStatus: 'On Time',
      currentSpeed: 87,
      delay: 0,
      currentStation: 'Lucknow NR (LKO)',
      nextStationETA: '04:30 AM',
      distanceLeft: 1445,
      routePoints: [
        [28.6139, 77.209], // NDLS
        [26.4499, 80.3319], // CNB
        [26.8467, 80.9462], // LKO
        [25.3176, 82.9739], // BSB
        [25.5941, 85.1376], // PNBE
        [27.4728, 95.017] // DBRG
      ],
      currentLocation: [26.8467, 80.9462],
      coaches: ['LOCO', 'PWR', 'H1', 'A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'B5', 'PC', 'S1', 'S2', 'S3', 'GEN', 'PWR'],
      route
    };
  }

  generateMockSchedule(trainNumber) {
    return {
      trainNumber,
      name: trainNumber === '12002' ? 'NDLS HBJ SHATABDI EXP' : 'SPECIAL FAST EXPRESS',
      class: ['1A', '2A', '3A', 'SL'],
      runsOn: {
        monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true
      },
      route: [
        { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: 'Source', departureTime: '06:00', distance: 0, day: 1 },
        { stationCode: 'MTJ', stationName: 'Mathura Jn', arrivalTime: '07:20', departureTime: '07:22', distance: 141, day: 1 },
        { stationCode: 'AGC', stationName: 'Agra Cantt', arrivalTime: '08:10', departureTime: '08:15', distance: 195, day: 1 },
        { stationCode: 'GWL', stationName: 'Gwalior Jn', arrivalTime: '09:40', departureTime: '09:42', distance: 313, day: 1 },
        { stationCode: 'VGLJ', stationName: 'VGL Jhansi Jn', arrivalTime: '10:45', departureTime: '10:53', distance: 410, day: 1 },
        { stationCode: 'BPL', stationName: 'Bhopal Jn', arrivalTime: '14:05', departureTime: '14:10', distance: 702, day: 1 },
        { stationCode: 'HBJ', stationName: 'Habibganj', arrivalTime: '14:20', departureTime: 'Destination', distance: 708, day: 1 },
      ]
    };
  }

  generateMockSearchTrains(from, to) {
    return [
      { id: '12424', name: 'NDLS DBRG RAJDHANI EXP', from, to, dep: '16:20', arr: '14:00', duration: '21h 40m', days: 'Daily', type: 'Rajdhani', avail: 18, delay: 0 },
      { id: '12002', name: 'NDLS HBJ SHATABDI EXP',  from, to, dep: '06:00', arr: '14:20',    duration: '8h 20m',  days: 'Daily', type: 'Shatabdi', avail: 0, delay: 0 },
      { id: '22415', name: 'VANDE BHARAT EXPRESS',   from, to, dep: '06:00', arr: '14:00',    duration: '8h 00m',  days: 'MTuWThFSaSu', type: 'Vande Bharat', avail: 5, delay: 12 },
      { id: '12301', name: 'HOWRAH RAJDHANI EXP',    from, to, dep: '16:55', arr: '10:05', duration: '17h 10m', days: 'Daily', type: 'Rajdhani', avail: 31, delay: 0 },
    ];
  }

  generateMockSeatAvailability(trainNumber, from, to, classCode) {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const isAvailable = Math.random() > 0.3;
      dates.push({
        date: futureDate.toISOString().split('T')[0],
        status: isAvailable ? `AVAILABLE-${Math.floor(Math.random() * 80 + 5)}` : `WL-${Math.floor(Math.random() * 20 + 1)}`,
        probability: isAvailable ? '100%' : `${Math.floor(Math.random() * 50 + 40)}%`,
      });
    }

    return {
      trainNumber,
      fromStation: from,
      toStation: to,
      classCode,
      quota: 'GN',
      availability: dates
    };
  }

  generateMockLiveStation(stationCode, hours) {
    const stationsMap = {
      'NDLS': 'New Delhi',
      'HWH': 'Howrah Jn',
      'CSMT': 'Mumbai CSMT',
      'MAS': 'Chennai Central',
      'SBC': 'KSR Bengaluru City',
      'PNBE': 'Patna Jn',
      'CNB': 'Kanpur Central',
      'BSB': 'Varanasi Jn',
      'LKO': 'Lucknow Charbagh',
    };

    const stationName = stationsMap[stationCode.toUpperCase()] || `${stationCode.toUpperCase()} Railway Station`;
    const now = new Date();
    const trains = [];
    
    // Support any station code by generating dynamic mock list
    const numberOfTrains = Math.floor(Math.random() * 5) + 6; // 6 to 10 trains
    
    const prefixes = ['12', '22', '14', '19', '11'];
    const types = ['SF EXP', 'RAJDHANI', 'SHATABDI', 'VANDE BHARAT', 'MAIL', 'HUMSAFAR'];
    const routes = [
      { from: 'NDLS', to: 'HWH' },
      { from: 'CSMT', to: 'NDLS' },
      { from: 'MAS', to: 'NDLS' },
      { from: 'PNBE', to: 'NDLS' },
      { from: 'HWH', to: 'CSMT' },
      { from: 'BDTS', to: 'SBC' },
      { from: 'GKP', to: 'LKO' },
    ];

    const allMockTrains = [
      { trainNumber: '12002', trainName: 'NDLS HBJ SHATABDI EXP', source: 'NDLS', destination: 'HBJ', platform: '1' },
      { trainNumber: '12424', trainName: 'NDLS DBRG RAJDHANI EXP', source: 'NDLS', destination: 'DBRG', platform: '16' },
      { trainNumber: '22415', trainName: 'VANDE BHARAT EXPRESS', source: 'NDLS', destination: 'BSB', platform: '11' },
      { trainNumber: '12301', trainName: 'HOWRAH RAJDHANI EXP', source: 'HWH', destination: 'NDLS', platform: '9' },
      { trainNumber: '12260', trainName: 'HWH NDLS DURONTO EXP', source: 'HWH', destination: 'NDLS', platform: '8' },
      { trainNumber: '12626', trainName: 'KERALA EXPRESS', source: 'NDLS', destination: 'TVC', platform: '3' },
      { trainNumber: '12952', trainName: 'MUMBAI RAJDHANI EXP', source: 'MMCT', destination: 'NDLS', platform: '3' },
      { trainNumber: '12259', trainName: 'NDLS HWH DURONTO EXP', source: 'NDLS', destination: 'HWH', platform: '12' },
      { trainNumber: '12802', trainName: 'PURUSHOTTAM EXPRESS', source: 'NDLS', destination: 'PURI', platform: '5' },
      { trainNumber: '12397', trainName: 'MAHABODHI EXPRESS', source: 'GAYA', destination: 'NDLS', platform: '7' }
    ];

    for (let i = 0; i < numberOfTrains; i++) {
      let mockTrain;
      if (i < allMockTrains.length && Math.random() > 0.3) {
        mockTrain = { ...allMockTrains[i] };
      } else {
        const trNum = prefixes[Math.floor(Math.random() * prefixes.length)] + Math.floor(1000 + Math.random() * 9000);
        const r = routes[Math.floor(Math.random() * routes.length)];
        mockTrain = {
          trainNumber: trNum,
          trainName: `${r.from} ${r.to} ${types[Math.floor(Math.random() * types.length)]}`,
          source: r.from,
          destination: r.to,
          platform: String(Math.floor(Math.random() * 12) + 1),
        };
      }

      // Adjust schedule times to be around current time + random offset (minutes)
      const offsetMinutes = Math.floor(Math.random() * (hours * 60));
      const trainTime = new Date(now.getTime() + offsetMinutes * 60 * 1000);
      
      const formatTime = (date) => {
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      };

      const scheduledTime = formatTime(trainTime);
      const isArrival = Math.random() > 0.4;
      
      const delay = Math.random() > 0.4 ? (Math.random() > 0.5 ? Math.floor(Math.random() * 45) + 10 : Math.floor(Math.random() * 180) + 60) : 0;
      
      const expectedTime = formatTime(new Date(trainTime.getTime() + delay * 60 * 1000));

      trains.push({
        trainNumber: mockTrain.trainNumber,
        trainName: mockTrain.trainName,
        source: mockTrain.source,
        destination: mockTrain.destination,
        stationCode: stationCode.toUpperCase(),
        scheduledArrival: isArrival ? scheduledTime : null,
        scheduledDeparture: !isArrival ? scheduledTime : null,
        actualArrival: isArrival ? expectedTime : null,
        actualDeparture: !isArrival ? expectedTime : null,
        delayArrival: isArrival ? delay : 0,
        delayDeparture: !isArrival ? delay : 0,
        platform: mockTrain.platform,
        status: delay === 0 ? 'On Time' : `Delayed by ${delay} mins`
      });
    }

    // Sort trains by actual arrival/departure time
    trains.sort((a, b) => {
      const timeA = a.actualArrival || a.actualDeparture;
      const timeB = b.actualArrival || b.actualDeparture;
      return timeA.localeCompare(timeB);
    });

    return {
      stationName,
      stationCode: stationCode.toUpperCase(),
      queryHours: hours,
      trains,
      totalTrains: trains.length,
      lastUpdated: new Date().toLocaleTimeString()
    };
  }
}

export default new RapidApiService();
