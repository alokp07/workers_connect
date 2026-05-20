// Admin page logic - path-based routing
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('login.html')) initLogin();
  else if (path.includes('dashboard.html')) initDashboard();
  else if (path.includes('approvals.html')) initApprovals();
  else if (path.includes('users.html')) initUsers();
  else if (path.includes('categories.html')) initCategories();
  else if (path.includes('bookings.html')) initBookings();
  else if (path.includes('reviews.html')) initReviews();
  else if (path.includes('activity-log.html')) initActivityLog();
});

// ==========================================
// LOGIN
// ==========================================
function initLogin() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearValidation();

    const email = form.email.value.trim();
    const password = form.password.value;

    const valid = validateForm({
      email: [() => validators.email(email)],
      password: [() => validators.required(password, 'Password')],
    });
    if (!valid) return;

    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.user.role !== 'admin') {
        toast.error('This login is for admins only');
        btn.disabled = false;
        btn.textContent = 'Sign In';
        return;
      }
      auth.setAuth(res.data.token, res.data.user);
      toast.success('Login successful!');
      window.location.href = '/admin/dashboard.html';
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}

// ==========================================
// DASHBOARD
// ==========================================
async function initDashboard() {
  setupSidebar();

  try {
    const res = await api.get('/admin/stats');
    const d = res.data;

    setText('stat-total-users', d.total_users);
    setText('stat-pending-approvals', d.pending_approvals);
    setText('stat-total-bookings', d.total_bookings);
    setText('stat-total-reviews', d.total_reviews);

    // Recent activity
    const activityEl = document.getElementById('recent-activity');
    if (activityEl && d.recent_activity && d.recent_activity.length > 0) {
      activityEl.innerHTML = d.recent_activity.map(a => `
        <div class="timeline-item">
          <div class="timeline-item-content">
            <h4>${escapeHtml(a.action_type.replace(/_/g, ' '))}</h4>
            <p>${escapeHtml(a.description || '')}</p>
            <span style="font-size:var(--font-size-xs);color:var(--gray-400);">${timeAgo(a.created_at)}</span>
          </div>
        </div>
      `).join('');
    } else if (activityEl) {
      activityEl.innerHTML = '<p style="color:var(--gray-400);text-align:center;padding:var(--space-8);">No recent activity</p>';
    }
  } catch (err) {
    toast.error('Failed to load dashboard stats');
  }
}

// ==========================================
// APPROVALS
// ==========================================
let approvalsPage = 1;
let approvalsStatus = 'pending';

async function initApprovals() {
  setupSidebar();
  setupApprovalTabs();
  await loadApprovals();
}

function setupApprovalTabs() {
  document.querySelectorAll('#approval-tabs .tab, .tab[data-status]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#approval-tabs .tab, .tab[data-status]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      approvalsStatus = tab.dataset.status || 'pending';
      approvalsPage = 1;
      loadApprovals();
    });
  });
}

async function loadApprovals() {
  try {
    const res = await api.get(`/admin/approvals?status=${approvalsStatus}&page=${approvalsPage}&limit=10`);
    const tbody = document.getElementById('approvals-table-body');
    if (!tbody) return;

    if (res.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state" style="padding:var(--space-8);">No ${approvalsStatus} approval requests</td></tr>`;
    } else {
      tbody.innerHTML = res.data.map(a => {
        const user = a.user || {};
        const profile = a.profile || {};
        const category = profile.category || {};
        return `
          <tr>
            <td><strong>${escapeHtml(user.full_name)}</strong></td>
            <td>${escapeHtml(user.email)}</td>
            <td>${category.icon || ''} ${escapeHtml(category.name || '—')}</td>
            <td>${profile.years_experience || 0} yrs</td>
            <td>${escapeHtml(profile.location || '—')}</td>
            <td>${formatDate(a.created_at)}</td>
            <td>${statusBadge(a.status)}</td>
            <td>
              ${a.status === 'pending' ? `
                <button class="btn btn-success btn-sm" onclick="handleApproval('${a.id}', 'approved')">Approve</button>
                <button class="btn btn-danger btn-sm" onclick="handleApproval('${a.id}', 'rejected')">Reject</button>
              ` : '—'}
            </td>
          </tr>
        `;
      }).join('');
    }

    renderPagination('approvals-pagination', res.pagination, (page) => {
      approvalsPage = page;
      loadApprovals();
    });
  } catch (err) {
    toast.error('Failed to load approvals');
  }
}

async function handleApproval(id, status) {
  let admin_notes = '';
  if (status === 'rejected') {
    const notes = await modal.prompt('Reject Worker', 'Reason for rejection (optional):', 'Enter reason...');
    if (notes === null) return;
    admin_notes = notes;
  } else {
    const confirmed = await modal.confirm('Approve Worker', 'Are you sure you want to approve this worker?', 'Yes, approve');
    if (!confirmed) return;
  }

  try {
    await api.put(`/admin/approvals/${id}`, { status, admin_notes });
    toast.success(`Worker ${status}`);
    loadApprovals();
  } catch (err) {
    toast.error(err.message);
  }
}
window.handleApproval = handleApproval;

// ==========================================
// USERS
// ==========================================
let usersPage = 1;
let usersRole = '';
let usersSearch = '';

async function initUsers() {
  setupSidebar();

  // Search
  const searchInput = document.getElementById('users-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      usersSearch = searchInput.value;
      usersPage = 1;
      loadUsers();
    }, 400));
  }

  // Role filter
  document.querySelectorAll('#users-role-filter .filter-chip, .filter-chip[data-role]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#users-role-filter .filter-chip, .filter-chip[data-role]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      usersRole = chip.dataset.role || '';
      usersPage = 1;
      loadUsers();
    });
  });

  await loadUsers();
}

async function loadUsers() {
  try {
    let url = `/admin/users?page=${usersPage}&limit=20`;
    if (usersRole) url += `&role=${usersRole}`;
    if (usersSearch) url += `&search=${encodeURIComponent(usersSearch)}`;

    const res = await api.get(url);
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (res.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state" style="padding:var(--space-8);">No users found</td></tr>`;
    } else {
      tbody.innerHTML = res.data.map(u => `
        <tr>
          <td>
            <div class="flex-gap">
              ${renderAvatar(u)}
              <strong>${escapeHtml(u.full_name)}</strong>
            </div>
          </td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="badge badge-${u.role === 'admin' ? 'completed' : u.role === 'worker' ? 'accepted' : 'pending'}">${u.role}</span></td>
          <td>${u.is_blocked ? '<span class="badge badge-blocked">Blocked</span>' : '<span class="badge badge-active">Active</span>'}</td>
          <td>${formatDate(u.created_at)}</td>
          <td>
            ${u.role !== 'admin' ? `
              <button class="btn ${u.is_blocked ? 'btn-success' : 'btn-danger'} btn-sm" onclick="toggleBlock('${u.id}', ${u.is_blocked})">
                ${u.is_blocked ? 'Unblock' : 'Block'}
              </button>
            ` : '—'}
          </td>
        </tr>
      `).join('');
    }

    renderPagination('users-pagination', res.pagination, (page) => {
      usersPage = page;
      loadUsers();
    });
  } catch (err) {
    toast.error('Failed to load users');
  }
}

async function toggleBlock(userId, isBlocked) {
  const action = isBlocked ? 'unblock' : 'block';
  const confirmed = await modal.confirm(
    `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
    `Are you sure you want to ${action} this user?`,
    `Yes, ${action}`
  );
  if (!confirmed) return;

  try {
    await api.put(`/admin/users/${userId}/block`);
    toast.success(`User ${action}ed`);
    loadUsers();
  } catch (err) {
    toast.error(err.message);
  }
}
window.toggleBlock = toggleBlock;

// ==========================================
// CATEGORIES
// ==========================================
async function initCategories() {
  setupSidebar();

  const addBtn = document.getElementById('add-category-btn');
  if (addBtn) addBtn.addEventListener('click', () => showCategoryModal());

  await loadCategories();
}

async function loadCategories() {
  try {
    const res = await api.get('/categories/all');
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;

    if (res.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state" style="padding:var(--space-8);">No categories</td></tr>`;
    } else {
      tbody.innerHTML = res.data.map(c => `
        <tr>
          <td style="font-size:1.5rem;">${c.icon}</td>
          <td><strong>${escapeHtml(c.name)}</strong></td>
          <td><code>${escapeHtml(c.slug)}</code></td>
          <td>${c.is_active ? '<span class="badge badge-active">Active</span>' : '<span class="badge badge-cancelled">Inactive</span>'}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="editCategory('${c.id}', '${escapeHtml(c.name)}', '${c.icon}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteCategory('${c.id}', '${escapeHtml(c.name)}')">Delete</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    toast.error('Failed to load categories');
  }
}

async function showCategoryModal(id = '', name = '', icon = '') {
  const data = await modal.form(id ? 'Edit Category' : 'Add Category', [
    { name: 'name', label: 'Category Name', type: 'text', placeholder: 'e.g. Plumbing', value: name },
    { name: 'icon', label: 'Icon (emoji)', type: 'text', placeholder: 'e.g. 🔧', value: icon },
  ]);

  if (!data) return;
  if (!data.name.trim()) { toast.error('Name is required'); return; }

  try {
    if (id) {
      await api.put(`/categories/${id}`, { name: data.name, icon: data.icon || '🔧' });
      toast.success('Category updated');
    } else {
      await api.post('/categories', { name: data.name, icon: data.icon || '🔧' });
      toast.success('Category created');
    }
    loadCategories();
  } catch (err) {
    toast.error(err.message);
  }
}

async function editCategory(id, name, icon) {
  showCategoryModal(id, name, icon);
}
window.editCategory = editCategory;

async function deleteCategory(id, name) {
  const confirmed = await modal.confirm('Delete Category', `Delete "${name}"? This cannot be undone.`, 'Yes, delete');
  if (!confirmed) return;

  try {
    await api.delete(`/categories/${id}`);
    toast.success('Category deleted');
    loadCategories();
  } catch (err) {
    toast.error(err.message);
  }
}
window.deleteCategory = deleteCategory;

// ==========================================
// BOOKINGS
// ==========================================
let adminBookingsPage = 1;
let adminBookingsStatus = '';

async function initBookings() {
  setupSidebar();

  document.querySelectorAll('#bookings-status-filter .filter-chip, .filter-chip[data-status]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#bookings-status-filter .filter-chip, .filter-chip[data-status]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      adminBookingsStatus = chip.dataset.status || '';
      adminBookingsPage = 1;
      loadBookings();
    });
  });

  await loadBookings();
}

async function loadBookings() {
  try {
    let url = `/admin/bookings?page=${adminBookingsPage}&limit=20`;
    if (adminBookingsStatus) url += `&status=${adminBookingsStatus}`;

    const res = await api.get(url);
    const tbody = document.getElementById('bookings-table-body');
    if (!tbody) return;

    if (res.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state" style="padding:var(--space-8);">No bookings found</td></tr>`;
    } else {
      tbody.innerHTML = res.data.map(b => `
        <tr>
          <td>${escapeHtml(b.client?.full_name || '—')}</td>
          <td>${escapeHtml(b.worker?.full_name || '—')}</td>
          <td>${b.category ? `${b.category.icon} ${b.category.name}` : '—'}</td>
          <td title="${escapeHtml(b.description)}">${escapeHtml((b.description || '').slice(0, 50))}${b.description?.length > 50 ? '...' : ''}</td>
          <td>${formatDate(b.created_at)}</td>
          <td>${statusBadge(b.status)}</td>
        </tr>
      `).join('');
    }

    renderPagination('bookings-pagination', res.pagination, (page) => {
      adminBookingsPage = page;
      loadBookings();
    });
  } catch (err) {
    toast.error('Failed to load bookings');
  }
}

// ==========================================
// REVIEWS
// ==========================================
let adminReviewsPage = 1;

async function initReviews() {
  setupSidebar();
  await loadReviews();
}

async function loadReviews() {
  try {
    const res = await api.get(`/admin/reviews?page=${adminReviewsPage}&limit=20`);
    const tbody = document.getElementById('reviews-table-body');
    if (!tbody) return;

    if (res.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state" style="padding:var(--space-8);">No reviews found</td></tr>`;
    } else {
      tbody.innerHTML = res.data.map(r => `
        <tr>
          <td>${escapeHtml(r.client?.full_name || '—')}</td>
          <td>${escapeHtml(r.worker?.full_name || '—')}</td>
          <td>${renderStars(r.rating)}</td>
          <td title="${escapeHtml(r.comment)}">${escapeHtml((r.comment || '').slice(0, 60))}${r.comment?.length > 60 ? '...' : ''}</td>
          <td>${formatDate(r.created_at)}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="removeReview('${r.id}')">Remove</button>
          </td>
        </tr>
      `).join('');
    }

    renderPagination('reviews-pagination', res.pagination, (page) => {
      adminReviewsPage = page;
      loadReviews();
    });
  } catch (err) {
    toast.error('Failed to load reviews');
  }
}

async function removeReview(id) {
  const confirmed = await modal.confirm('Remove Review', 'Are you sure you want to remove this review?', 'Yes, remove');
  if (!confirmed) return;

  try {
    await api.delete(`/admin/reviews/${id}`);
    toast.success('Review removed');
    loadReviews();
  } catch (err) {
    toast.error(err.message);
  }
}
window.removeReview = removeReview;

// ==========================================
// ACTIVITY LOG
// ==========================================
let activityPage = 1;

async function initActivityLog() {
  setupSidebar();
  await loadActivityLog();
}

async function loadActivityLog() {
  try {
    const res = await api.get(`/admin/activity-log?page=${activityPage}&limit=30`);
    const container = document.getElementById('activity-timeline');
    if (!container) return;

    if (res.data.length === 0) {
      container.innerHTML = '<p style="color:var(--gray-400);text-align:center;padding:var(--space-8);">No activity logs</p>';
    } else {
      container.innerHTML = res.data.map(a => `
        <div class="timeline-item animate-fadeInUp">
          <div class="timeline-item-time">${formatDateTime(a.created_at)}</div>
          <div class="timeline-item-content">
            <h4>${escapeHtml(a.action_type.replace(/_/g, ' '))}</h4>
            <p>${escapeHtml(a.description || '')}</p>
            ${a.user ? `<span style="font-size:var(--font-size-xs);color:var(--gray-400);">by ${escapeHtml(a.user.full_name)}</span>` : ''}
          </div>
        </div>
      `).join('');
    }

    renderPagination('activity-pagination', res.pagination, (page) => {
      activityPage = page;
      loadActivityLog();
    });
  } catch (err) {
    toast.error('Failed to load activity log');
  }
}

// ==========================================
// HELPERS
// ==========================================
function setupSidebar() {
  // Active sidebar link
  const path = window.location.pathname;
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.includes(href)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Logout
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      auth.logout();
    });
  }

  // Mobile sidebar toggle
  const menuBtn = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
