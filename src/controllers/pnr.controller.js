import pnrService from '../services/pnr.service.js';

/**
 * Fetch PNR Status
 * Route: GET /api/pnr/:pnrNumber
 * Note: Decodes optional userId from jwt if authorization header is provided, linking PNR to profile
 */
export const getStatus = async (req, res, next) => {
  try {
    const { pnrNumber } = req.params;
    
    // Check if user is authenticated (pnrService can link it to user profile)
    const userId = req.user ? req.user._id : null;

    const pnrRecord = await pnrService.getPNRStatus(pnrNumber, userId);
    res.status(200).json({
      success: true,
      data: pnrRecord,
    });
  } catch (error) {
    if (error.message.includes('Invalid PNR')) {
      res.status(400);
    }
    next(error);
  }
};

/**
 * Remove PNR from saved list
 * Route: DELETE /api/pnr/:pnrNumber
 */
export const unlinkPNR = async (req, res, next) => {
  try {
    const { pnrNumber } = req.params;
    
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized to perform this action');
    }

    const updatedList = await pnrService.unlinkPnrFromUser(req.user._id, pnrNumber);
    res.status(200).json({
      success: true,
      message: 'PNR unlinked successfully',
      data: updatedList,
    });
  } catch (error) {
    next(error);
  }
};
