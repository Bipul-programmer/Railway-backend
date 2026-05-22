import express from 'express';
import { getStatus, unlinkPNR } from '../controllers/pnr.controller.js';
import { protect, optionalProtect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:pnrNumber', optionalProtect, getStatus);
router.delete('/:pnrNumber', protect, unlinkPNR);

export default router;
