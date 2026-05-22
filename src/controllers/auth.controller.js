import authService from '../services/auth.service.js';

/**
 * Register a new user
 * Route: POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please enter name, email, and password');
    }

    const userData = await authService.registerUser(name, email, password);
    res.status(201).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user & get token
 * Route: POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter email and password');
    }

    const userData = await authService.loginUser(email, password);
    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      res.status(401);
    }
    next(error);
  }
};

/**
 * Get current user profile
 * Route: GET /api/auth/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const profile = await authService.getUserProfile(req.user._id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle favorite train
 * Route: POST /api/auth/favorites
 */
export const toggleFavorite = async (req, res, next) => {
  try {
    const { trainNumber, trainName } = req.body;
    if (!trainNumber) {
      res.status(400);
      throw new Error('trainNumber is required');
    }

    const favorites = await authService.toggleFavoriteTrain(req.user._id, trainNumber, trainName || '');
    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};
