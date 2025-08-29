
class AuthDTO {
  
  
  static toPublicUser(user) {
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      created_at: user.created_at
    };
  }
  
  
  static toLoginResponse(user, token) {
    return {
      token,
      user: this.toPublicUser(user)
    };
  }
  
  
  static fromRegistrationRequest(requestData) {
    const { username, password, role = 'librarian' } = requestData;
    
    return {
      username: username?.trim(),
      password,
      role: role.toLowerCase()
    };
  }
  
  
  static fromLoginRequest(requestData) {
    const { username, password } = requestData;
    
    return {
      username: username?.trim(),
      password
    };
  }
  
  
  static fromChangePasswordRequest(requestData) {
    const { currentPassword, newPassword } = requestData;
    
    return {
      currentPassword,
      newPassword
    };
  }
  
  
  static toUsersListResponse(users, pagination) {
    return {
      users: users.map(user => this.toPublicUser(user)),
      pagination
    };
  }
}

module.exports = AuthDTO; 