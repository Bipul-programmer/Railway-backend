import trainService from '../services/train.service.js';

/**
 * Search trains between stations
 * Route: GET /api/trains/search
 */
export const searchTrains = async (req, res, next) => {
  try {
    const { from, to, date, query } = req.query;
    if (!from || !to) {
      if (query) {
        const trains = await trainService.searchTrainsByQuery(query);
        return res.status(200).json({
          success: true,
          count: trains.length,
          data: trains,
        });
      }
      res.status(400);
      throw new Error('Please provide both from and to station codes or a query search term');
    }

    const trains = await trainService.searchTrains(from, to, date || '');
    res.status(200).json({
      success: true,
      count: trains.length,
      data: trains,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get live location and tracking status of a train
 * Route: GET /api/trains/:trainNumber/live
 */
export const getLiveStatus = async (req, res, next) => {
  try {
    const { trainNumber } = req.params;
    if (!trainNumber) {
      res.status(400);
      throw new Error('Please provide trainNumber');
    }

    const liveStatus = await trainService.getLiveStatus(trainNumber);
    res.status(200).json({
      success: true,
      data: liveStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get train route schedule
 * Route: GET /api/trains/:trainNumber/schedule
 */
export const getSchedule = async (req, res, next) => {
  try {
    const { trainNumber } = req.params;
    if (!trainNumber) {
      res.status(400);
      throw new Error('Please provide trainNumber');
    }

    const schedule = await trainService.getTrainSchedule(trainNumber);
    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get live station arrivals/departures
 * Route: GET /api/trains/station/:stationCode
 */
export const getLiveStationStatus = async (req, res, next) => {
  try {
    const { stationCode } = req.params;
    const hours = parseInt(req.query.hours, 10) || 2;

    if (!stationCode) {
      res.status(400);
      throw new Error('Please provide a station code (e.g. NDLS, HWH, CSMT)');
    }

    if (![1, 2, 4].includes(hours)) {
      res.status(400);
      throw new Error('Hours must be 1, 2, or 4');
    }

    const data = await trainService.getLiveStationStatus(stationCode, hours);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check seat availability
 * Route: GET /api/trains/:trainNumber/availability
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const { trainNumber } = req.params;
    const { from, to, date, classCode } = req.query;

    if (!from || !to || !date || !classCode) {
      res.status(400);
      throw new Error('Please provide from, to, date, and classCode');
    }

    const availability = await trainService.getSeatAvailability(trainNumber, from, to, date, classCode);
    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};
