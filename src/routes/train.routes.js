import express from 'express';
import { searchTrains, getLiveStatus, getSchedule, checkAvailability, getLiveStationStatus } from '../controllers/train.controller.js';

const router = express.Router();

router.get('/search', searchTrains);
// Station status must come BEFORE /:trainNumber wildcards
router.get('/station/:stationCode', getLiveStationStatus);
router.get('/:trainNumber/live', getLiveStatus);
router.get('/:trainNumber/schedule', getSchedule);
router.get('/:trainNumber/availability', checkAvailability);

export default router;
