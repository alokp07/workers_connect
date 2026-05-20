const auth = {
  getToken() {
    return localStorage.getItem(LS_KEYS.TOKEN);
  },

  getUser() {
    const data = localStorage.getItem(LS_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  setAuth(token, user) {
    localStorage.setItem(LS_KEYS.TOKEN, token);
    localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem(LS_KEYS.TOKEN);
    localStorage.removeItem(LS_KEYS.USER);
    window.location.href = '/';
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  },

  requireAuth(role) {
    if (!this.isLoggedIn()) {
      window.location.href = `/${role}/login.html`;
      return false;
    }
    const user = this.getUser();
    if (user.role !== role) {
      window.location.href = '/';
      return false;
    }
    return true;
  },
};
