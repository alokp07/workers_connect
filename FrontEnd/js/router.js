// Page-level auth guard - include in pages that need auth
(function () {
  const path = window.location.pathname;
  const user = auth.getUser();
  const token = auth.getToken();

  // Determine required role from path
  let requiredRole = null;
  if (path.includes('/worker/')) requiredRole = ROLES.WORKER;
  else if (path.includes('/client/')) requiredRole = ROLES.CLIENT;
  else if (path.includes('/admin/')) requiredRole = ROLES.ADMIN;

  // Skip auth check for login/register pages
  if (path.includes('login.html') || path.includes('register.html')) {
    // If already logged in, redirect to dashboard
    if (token && user && requiredRole && user.role === requiredRole) {
      if (user.role === 'worker') {
        window.location.href = '/worker/dashboard.html';
      } else if (user.role === 'client') {
        window.location.href = '/client/dashboard.html';
      } else if (user.role === 'admin') {
        window.location.href = '/admin/dashboard.html';
      }
    }
    return;
  }

  // Require auth for dashboard pages
  if (requiredRole && (!token || !user || user.role !== requiredRole)) {
    window.location.href = requiredRole ? `/${requiredRole}/login.html` : '/';
    return;
  }

  // Worker pending approval check
  if (requiredRole === 'worker' && !path.includes('pending-approval.html')) {
    api.get('/workers/approval-status').then(res => {
      if (res.data && res.data.status === 'pending') {
        window.location.href = '/worker/pending-approval.html';
      } else if (res.data && res.data.status === 'rejected') {
        toast.error('Your account has been rejected. Contact support.');
        auth.logout();
      }
    }).catch(() => {});
  }
})();
