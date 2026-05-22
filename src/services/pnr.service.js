import PNRRecord from '../models/PNRRecord.model.js';
import User from '../models/User.model.js';
import rapidapiService from './rapidapi.service.js';

class PnrService {
  
  /**
   * Get PNR Status (with Smart DB Caching)
   */
  async getPNRStatus(pnrNumber, userId = null) {
    try {
      const pnr = pnrNumber.trim();
      if (pnr.length !== 10 || !/^\d+$/.test(pnr)) {
        throw new Error('Invalid PNR number format. Must be a 10-digit number.');
      }

      // Check local cache
      let record = await PNRRecord.findOne({ pnrNumber: pnr });

      // Cache validity window: 15 minutes
      const CACHE_WINDOW_MS = 15 * 60 * 1000;
      const isCacheValid = record && (Date.now() - new Date(record.lastUpdated).getTime() < CACHE_WINDOW_MS);

      if (isCacheValid) {
        console.log(`📦 Serving PNR ${pnr} from local MongoDB Cache`);
        
        // If a logged-in user requests it, bind it to their profile if not already
        if (userId) {
          await this.linkPnrToUser(userId, record);
        }
        return record;
      }

      // Fetch fresh status from RapidAPI (with rich mock fallback inside)
      console.log(`🌐 Fetching fresh PNR status for ${pnr} from API`);
      const apiStatus = await rapidapiService.getPNRStatus(pnr);

      // Save/Update in DB Cache
      if (record) {
        // Update existing record
        record.trainNumber = apiStatus.trainNumber;
        record.trainName = apiStatus.trainName;
        record.dateOfJourney = new Date(apiStatus.dateOfJourney);
        record.sourceStation = apiStatus.sourceStation;
        record.destinationStation = apiStatus.destinationStation;
        record.className = apiStatus.className;
        record.chartStatus = apiStatus.chartStatus;
        record.passengers = apiStatus.passengers;
        record.lastUpdated = new Date();
        await record.save();
      } else {
        // Create new record
        record = await PNRRecord.create({
          pnrNumber: pnr,
          trainNumber: apiStatus.trainNumber,
          trainName: apiStatus.trainName,
          dateOfJourney: new Date(apiStatus.dateOfJourney),
          sourceStation: apiStatus.sourceStation,
          destinationStation: apiStatus.destinationStation,
          className: apiStatus.className,
          chartStatus: apiStatus.chartStatus,
          passengers: apiStatus.passengers,
          lastUpdated: new Date(),
        });
      }

      // Link to user if userId provided
      if (userId) {
        await this.linkPnrToUser(userId, record);
      }

      return record;
    } catch (error) {
      console.error(`❌ Error in PnrService.getPNRStatus: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper to link a PNR to a User profile
   */
  async linkPnrToUser(userId, pnrRecord) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Check if already saved
      const alreadySaved = user.savedPNRs.some(item => item.pnrNumber === pnrRecord.pnrNumber);
      if (!alreadySaved) {
        user.savedPNRs.push({
          pnrNumber: pnrRecord.pnrNumber,
          dateOfJourney: pnrRecord.dateOfJourney,
          label: `${pnrRecord.sourceStation.code} ➔ ${pnrRecord.destinationStation.code}`,
        });
        await user.save();
        console.log(`🔗 Linked PNR ${pnrRecord.pnrNumber} to User ${user.email}`);
      }
    } catch (error) {
      console.error(`⚠️ Failed to link PNR to user profile: ${error.message}`);
    }
  }

  /**
   * Unlink PNR from User profile
   */
  async unlinkPnrFromUser(userId, pnrNumber) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      user.savedPNRs = user.savedPNRs.filter(item => item.pnrNumber !== pnrNumber);
      await user.save();
      return user.savedPNRs;
    } catch (error) {
      console.error(`❌ Error unlinking PNR from user: ${error.message}`);
      throw error;
    }
  }
}

export default new PnrService();
