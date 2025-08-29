
class AuthController {
  
  constructor(authService) {
    if (!authService) {
      throw new Error('AuthService is required');
    }
    this.authService = authService;
  }
  
  
  async login(req, res) {
    try {
      const result = await this.authService.login(req.body);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
      
    } catch (error) {
      console.error('Error during login:', error);
      
      if (error.message === 'Invalid username or password') {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async register(req, res) {
    try {
      const result = await this.authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error during registration:', error);
      
      if (error.message === 'Username already exists' || error.message === 'Email already exists') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('validation') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;
      
      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }
      
      const result = await this.authService.refreshToken(refresh_token);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error refreshing token:', error);
      
      if (error.message === 'Invalid refresh token') {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async changePassword(req, res) {
    try {
      const userId = req.user.id; // From authentication middleware
      const result = await this.authService.changePassword(userId, req.body);
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
      
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Password change failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role
        }
      });
      
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async logout(req, res) {
    try {
      res.json({
        success: true,
        message: 'Logout successful'
      });
      
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async validatePassword(req, res) {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }
      
      const validation = this.authService.validatePasswordStrength(password);
      
      res.json({
        success: true,
        message: 'Password validation completed',
        data: validation
      });
      
    } catch (error) {
      console.error('Error validating password:', error);
      res.status(500).json({
        success: false,
        message: 'Password validation failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AuthController; 