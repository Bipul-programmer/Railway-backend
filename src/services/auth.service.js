import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';

class AuthService {
  
  /**
   * Generate JWT Token
   */
  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'railway_secret_key_9921', {
      expiresIn: '30d',
    });
  }

  /**
   * Register User
   */
  async registerUser(name, email, password) {
    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new Error('User already exists with this email');
      }

      const user = await User.create({
        name,
        email,
        password,
      });

      if (user) {
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: this.generateToken(user._id),
        };
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error(`❌ Error in AuthService.registerUser: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login User
   */
  async loginUser(email, password) {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        savedPNRs: user.savedPNRs,
        favorites: user.favorites,
        token: this.generateToken(user._id),
      };
    } catch (error) {
      console.error(`❌ Error in AuthService.loginUser: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get User Profile
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).populate('savedPNRs');
      if (!user) {
        throw new Error('User not found');
      }
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        savedPNRs: user.savedPNRs,
        favorites: user.favorites,
      };
    } catch (error) {
      console.error(`❌ Error in AuthService.getUserProfile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save/Remove Favorite Train
   */
  async toggleFavoriteTrain(userId, trainNumber, trainName) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const favoriteIndex = user.favorites.findIndex(fav => fav.trainNumber === trainNumber);

      if (favoriteIndex > -1) {
        // Remove from favorites
        user.favorites.splice(favoriteIndex, 1);
        console.log(`⭐ Removed train ${trainNumber} from User ${user.email} favorites`);
      } else {
        // Add to favorites
        user.favorites.push({ trainNumber, trainName });
        console.log(`⭐ Added train ${trainNumber} to User ${user.email} favorites`);
      }

      await user.save();
      return user.favorites;
    } catch (error) {
      console.error(`❌ Error in AuthService.toggleFavoriteTrain: ${error.message}`);
      throw error;
    }
  }
}

export default new AuthService();
