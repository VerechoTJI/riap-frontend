export function getToken() {
  const userStr = localStorage.getItem('riap_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.token || null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
