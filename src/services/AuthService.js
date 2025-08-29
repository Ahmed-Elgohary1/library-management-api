const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthDTO = require('../dto/AuthDTO');


class AuthService {
  
  constructor(userDAO) {
    this.userDAO = require('../dao/UserDAO');
  }
  

  async login(loginData) {
    const { username, password } = AuthDTO.fromLoginRequest(loginData);
    
    const user = await this.userDAO.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }
    
    await this.userDAO.updateLastLogin(user.id);
    
    const token = this.generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });
    
    return AuthDTO.toLoginResponse(user, token);
  }
  

  async register(userData) {
    const sanitizedData = AuthDTO.fromRegisterRequest(userData);
    
    const existingUser = await this.userDAO.findByUsername(sanitizedData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    if (sanitizedData.email) {
      const existingEmail = await this.userDAO.findByEmail(sanitizedData.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }
    
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(sanitizedData.password, saltRounds);
    
    const newUser = await this.userDAO.create({
      ...sanitizedData,
      password_hash: passwordHash
    });
    
    const token = this.generateToken({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    });
    
    return AuthDTO.toRegisterResponse({
      user: newUser,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  }
  

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      
      const user = await this.userDAO.findById(decoded.id);
      if (!user || !user.is_active) {
        throw new Error('Invalid refresh token');
      }
      
      const newToken = this.generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      });
      
      return AuthDTO.toTokenRefreshResponse({
        token: newToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      });
      
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  

  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = AuthDTO.fromPasswordChangeRequest(passwordData);
    
    const user = await this.userDAO.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    await this.userDAO.updatePassword(userId, newPasswordHash);
    
    return true;
  }
  

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  

  generateToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    const options = {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: process.env.JWT_ISSUER || 'library-management-api'
    };
    
    return jwt.sign(payload, secret, options);
  }
  

  generateRefreshToken(payload) {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT secret is required for refresh tokens');
    }
    
    const options = {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'library-management-api'
    };
    
    return jwt.sign(payload, secret, options);
  }
  

  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const isValid = password.length >= minLength && hasUppercase && hasLowercase && hasNumbers;
    
    return {
      isValid,
      errors: [
        ...(password.length < minLength ? [`Password must be at least ${minLength} characters long`] : []),
        ...(hasUppercase ? [] : ['Password must contain at least one uppercase letter']),
        ...(hasLowercase ? [] : ['Password must contain at least one lowercase letter']),
        ...(hasNumbers ? [] : ['Password must contain at least one number'])
      ],
      strength: this.calculatePasswordStrength(password)
    };
  }
  

  calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }
}

module.exports = AuthService; 