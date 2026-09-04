// Real Firebase Authentication State Adapter
// Fully backed by authService.js (Zero fake local logins)
import { authService } from '../services/authService.js';

export const authState = {
  get user() {
    return authService.user;
  },

  get isAuthenticated() {
    return authService.isAuthenticated;
  },

  get isLoading() {
    return authService.isLoading;
  },

  get isOwner() {
    return authService.isOwner;
  },

  get isStaff() {
    return authService.isStaff;
  },

  async login(identifier, password) {
    return await authService.loginWithEmail(identifier, password);
  },

  async sendOtp(phoneNumber, containerId) {
    return await authService.sendOtp(phoneNumber, containerId);
  },

  async verifyOtp(code, options) {
    return await authService.verifyOtp(code, options);
  },

  async logout() {
    return await authService.logout();
  },

  async forgotPassword(email) {
    return await authService.sendPasswordReset(email);
  },

  subscribe(fn) {
    return authService.subscribe(fn);
  }
};
