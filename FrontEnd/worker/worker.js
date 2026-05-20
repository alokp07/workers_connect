// Worker page logic - path-based routing
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('login.html')) initLogin();
  else if (path.includes('register.html')) initRegister();
  else if (path.includes('pending-approval.html')) initPendingApproval();
  else if (path.includes('dashboard.html')) initDashboard();
  else if (path.includes('profile.html')) initProfile();
  else if (path.includes('bookings.html')) initBookings();
  else if (path.includes('reviews.html')) initReviews();
});

// ==========================================
// LOGIN
// ==========================================
function initLogin() {
  const form = document.getElementById('worker-login-form') || document.getElementById('login-form');
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

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.user.role !== 'worker') {
        toast.error('This login is for workers only');
        btn.disabled = false;
        btn.textContent = 'Sign In';
        return;
      }
      auth.setAuth(res.data.token, res.data.user);
      toast.success('Login successful!');

      if (res.data.approval_status === 'pending') {
        window.location.href = '/worker/pending-approval.html';
      } else {
        window.location.href = '/worker/dashboard.html';
      }
    } catch (err) {
      toast.error(friendlyError(err));
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}

// ==========================================
// REGISTER
// ==========================================
function initRegister() {
  const form = document.getElementById('worker-register-form') || document.getElementById('register-form');
  if (!form) return;

  // Load categories
  loadCategories();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearValidation();

    const data = {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      password: form.password.value,
      bio: form.bio.value.trim(),
      category_id: form.category_id.value,
      skills: form.skills.value.split(',').map(s => s.trim()).filter(Boolean),
      years_experience: parseInt(form.years_experience.value) || 0,
      location: form.location.value.trim(),
    };

    const valid = validateForm({
      full_name: [() => validators.required(data.full_name, 'Full name')],
      email: [() => validators.email(data.email)],
      password: [() => validators.password(data.password)],
    });
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creating account...';

    try {
      const res = await api.post('/auth/register/worker', data);
      auth.setAuth(res.data.token, res.data.user);

      // Upload avatar if selected
      const avatarInput = form.querySelector('[name="avatar"]');
      if (avatarInput && avatarInput.files[0]) {
        const fd = new FormData();
        fd.append('avatar', avatarInput.files[0]);
        await api.upload('/upload/avatar', fd);
      }

      toast.success('Registration successful! Awaiting approval.');
      window.location.href = '/worker/pending-approval.html';
    } catch (err) {
      toast.error(friendlyError(err));
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
}

async function loadCategories() {
  try {
    const res = await api.get('/categories');
    const select = document.querySelector('[name="category_id"]');
    if (!select) return;
    res.data.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.icon} ${cat.name}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

// ==========================================
// PENDING APPROVAL
// ==========================================
function initPendingApproval() {
  const checkBtn = document.getElementById('check-status-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const lastChecked = document.getElementById('last-checked');

  async function checkStatus() {
    try {
      const res = await api.get('/workers/approval-status');
      if (res.data.status === 'approved') {
        toast.success('Your account has been approved!');
        setTimeout(() => window.location.href = '/worker/dashboard.html', 1000);
      } else if (res.data.status === 'rejected') {
        toast.error('Your account has been rejected.');
        setTimeout(() => auth.logout(), 2000);
      }
      if (lastChecked) lastChecked.textContent = `Last checked: ${new Date().toLocaleTimeString()}`;
    } catch (err) {
      console.error(err);
    }
  }

  if (checkBtn) checkBtn.addEventListener('click', checkStatus);
  if (logoutBtn) logoutBtn.addEventListener('click', () => auth.logout());

  // Auto-poll every 30s
  checkStatus();
  setInterval(checkStatus, 30000);
}

// ==========================================
// DASHBOARD
// ==========================================
async function initDashboard() {
  setupHeader();
  await loadDashboardData();
}

async function loadDashboardData() {
  try {
    const [bookingsRes] = await Promise.all([
      api.get('/bookings'),
    ]);

    const bookings = bookingsRes.data;
    const pending = bookings.filter(b => b.status === 'pending');
    const active = bookings.filter(b => b.status === 'accepted');
    const completed = bookings.filter(b => b.status === 'completed');

    // Stats
    setStatValue('stat-pending', pending.length);
    setStatValue('stat-active', active.length);
    setStatValue('stat-completed', completed.length);

    // Get profile for rating
    try {
      const profileRes = await api.get('/workers/profile/me');
      setStatValue('stat-rating', Number(profileRes.data.avg_rating).toFixed(1));
    } catch { setStatValue('stat-rating', '—'); }

    // Incoming requests
    const container = document.getElementById('incoming-requests');
    const emptyState = document.getElementById('no-requests');

    if (pending.length === 0) {
      if (container) container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (container) container.innerHTML = pending.map(renderBookingCard).join('');
    }
  } catch (err) {
    toast.error('Failed to load dashboard data');
    console.error(err);
  }
}

function renderBookingCard(booking) {
  const client = booking.client || {};
  return `
    <div class="booking-card animate-fadeInUp">
      <div class="booking-card-header">
        <div class="flex-gap">
          ${renderAvatar(client)}
          <div>
            <h4>${escapeHtml(client.full_name || 'Client')}</h4>
            <span class="badge ${STATUS_COLORS[booking.status]}">${STATUS_LABELS[booking.status]}</span>
          </div>
        </div>
        ${booking.category ? `<span class="tag tag-indigo">${booking.category.icon} ${booking.category.name}</span>` : ''}
      </div>
      <div class="booking-card-body">${escapeHtml(booking.description)}</div>
      <div class="booking-card-details">
        ${booking.preferred_date ? `<span>📅 ${formatDate(booking.preferred_date)}</span>` : ''}
        ${booking.preferred_time ? `<span>🕐 ${booking.preferred_time}</span>` : ''}
        ${booking.location ? `<span>📍 ${escapeHtml(booking.location)}</span>` : ''}
      </div>
      <div class="booking-card-actions">
        ${booking.status === 'pending' ? `
          <button class="btn btn-success btn-sm" onclick="handleBookingAction('${booking.id}', 'accept')">Accept</button>
          <button class="btn btn-danger btn-sm" onclick="handleBookingAction('${booking.id}', 'decline')">Decline</button>
        ` : ''}
        ${booking.status === 'accepted' ? `
          <button class="btn btn-primary btn-sm" onclick="handleBookingAction('${booking.id}', 'complete')">Mark Complete</button>
        ` : ''}
      </div>
    </div>
  `;
}

async function handleBookingAction(bookingId, action) {
  const actionLabels = { accept: 'accept', decline: 'decline', complete: 'mark as complete' };
  const confirmed = await modal.confirm(
    `${action.charAt(0).toUpperCase() + action.slice(1)} Booking`,
    `Are you sure you want to ${actionLabels[action]} this booking?`,
    'Yes, proceed'
  );
  if (!confirmed) return;

  try {
    let data = {};
    if (action === 'decline') {
      const reason = await modal.prompt('Decline Reason', 'Optionally provide a reason:', 'Enter reason...');
      if (reason !== null) data.decline_reason = reason;
    }
    await api.put(`/bookings/${bookingId}/${action}`, data);
    toast.success(`Booking ${action}ed successfully`);
    loadDashboardData();
  } catch (err) {
    toast.error(friendlyError(err));
  }
}
window.handleBookingAction = handleBookingAction;

// ==========================================
// PROFILE
// ==========================================
async function initProfile() {
  setupHeader();
  try {
    const res = await api.get('/workers/profile/me');
    const profile = res.data;
    const user = profile.user || {};

    // Avatar
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) avatarEl.innerHTML = renderAvatar(user, 'avatar-xl');

    // Info
    setText('profile-name', user.full_name);
    setText('profile-category', profile.category ? `${profile.category.icon} ${profile.category.name}` : 'No category');
    const ratingEl = document.getElementById('profile-rating');
    if (ratingEl) ratingEl.innerHTML = renderStars(profile.avg_rating);

    // Stats
    setStatValue('profile-jobs-count', profile.total_reviews || 0);
    setStatValue('profile-experience', profile.years_experience || 0);
    setStatValue('profile-reviews-count', profile.total_reviews || 0);

    // Form fields
    setFormValue('bio', profile.bio);
    setFormValue('years_experience', profile.years_experience);
    setFormValue('location', profile.location);
    setFormValue('skills', (profile.skills || []).join(', '));
    setFormValue('portfolio_urls', (profile.portfolio_urls || []).join('\n'));

    // Category select
    const catRes = await api.get('/categories');
    const catSelect = document.querySelector('[name="category_id"]');
    if (catSelect) {
      catSelect.innerHTML = '<option value="">Select category</option>';
      catRes.data.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${cat.icon} ${cat.name}`;
        if (profile.category_id === cat.id) opt.selected = true;
        catSelect.appendChild(opt);
      });
    }

    // Availability
    const avail = document.getElementById('availability');
    if (avail) avail.checked = profile.availability;

    // Skills display
    const skillsList = document.getElementById('skills-list');
    if (skillsList && profile.skills) {
      skillsList.innerHTML = profile.skills.map(s => `<span class="tag tag-indigo">${escapeHtml(s)}</span>`).join('');
    }

    // Save
    const saveBtn = document.getElementById('save-profile-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const form = document.getElementById('profile-form');
        const updates = {
          bio: form.bio.value.trim(),
          category_id: form.category_id.value || null,
          skills: form.skills.value.split(',').map(s => s.trim()).filter(Boolean),
          years_experience: parseInt(form.years_experience.value) || 0,
          location: form.location.value.trim(),
          portfolio_urls: form.portfolio_urls.value.split('\n').map(s => s.trim()).filter(Boolean),
          availability: document.getElementById('availability').checked,
        };

        try {
          saveBtn.disabled = true;
          saveBtn.textContent = 'Saving...';
          await api.put('/workers/profile/me', updates);
          toast.success('Profile updated successfully');
          initProfile();
        } catch (err) {
          toast.error(friendlyError(err));
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Profile';
        }
      });
    }

    // Avatar upload
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
      avatarInput.addEventListener('change', async () => {
        if (!avatarInput.files[0]) return;
        const fd = new FormData();
        fd.append('avatar', avatarInput.files[0]);
        try {
          await api.upload('/upload/avatar', fd);
          toast.success('Avatar updated');
          initProfile();
        } catch (err) {
          toast.error(friendlyError(err));
        }
      });
    }
  } catch (err) {
    toast.error('Failed to load profile');
    console.error(err);
  }
}

// ==========================================
// BOOKINGS
// ==========================================
let bookingsPage = 1;
let bookingsFilter = '';

async function initBookings() {
  setupHeader();
  setupBookingTabs();
  await loadBookings();
}

function setupBookingTabs() {
  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab[data-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      bookingsFilter = tab.dataset.tab === 'all' ? '' : tab.dataset.tab;
      bookingsPage = 1;
      loadBookings();
    });
  });
}

async function loadBookings() {
  try {
    let url = `/bookings?page=${bookingsPage}&limit=10`;
    if (bookingsFilter) url += `&status=${bookingsFilter}`;

    const res = await api.get(url);
    const container = document.getElementById('bookings-list');
    const emptyState = document.getElementById('no-bookings');

    if (res.data.length === 0) {
      if (container) container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (container) container.innerHTML = res.data.map(renderBookingCard).join('');
    }

    renderPagination('pagination-container', res.pagination, (page) => {
      bookingsPage = page;
      loadBookings();
    });
  } catch (err) {
    toast.error('Failed to load bookings');
  }
}

// ==========================================
// REVIEWS
// ==========================================
async function initReviews() {
  setupHeader();
  try {
    const res = await api.get('/reviews/my');
    const reviews = res.data;

    // Summary
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : '0.0';

    setText('avg-rating', avg);
    const avgStars = document.getElementById('avg-stars');
    if (avgStars) avgStars.innerHTML = renderStars(parseFloat(avg));
    setText('total-reviews', `${total} reviews`);

    // Rating bars
    for (let i = 5; i >= 1; i--) {
      const count = reviews.filter(r => r.rating === i).length;
      const pct = total > 0 ? (count / total * 100) : 0;
      const bar = document.getElementById(`bar-${i}`);
      if (bar) { bar.classList.remove('skeleton'); bar.style.width = `${pct}%`; bar.style.background = 'var(--brand-amber)'; }
      setText(`count-${i}`, count);
    }

    // Reviews list
    const container = document.getElementById('reviews-list');
    const emptyState = document.getElementById('no-reviews');

    if (reviews.length === 0) {
      if (container) container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (container) container.innerHTML = reviews.map(renderReviewCard).join('');
    }
  } catch (err) {
    toast.error('Failed to load reviews');
  }
}

function renderReviewCard(review) {
  const client = review.client || {};
  return `
    <div class="review-card animate-fadeInUp">
      <div class="review-card-header">
        <div class="review-card-user">
          ${renderAvatar(client)}
          <div>
            <strong>${escapeHtml(client.full_name || 'Client')}</strong>
            <div style="font-size: var(--font-size-xs); color: var(--gray-400);">${timeAgo(review.created_at)}</div>
          </div>
        </div>
        <div>${renderStars(review.rating)}</div>
      </div>
      <div class="review-card-comment">${escapeHtml(review.comment)}</div>
      ${review.worker_reply ? `
        <div class="review-card-reply">
          <div class="review-card-reply-label">Your Reply</div>
          <p style="margin:0; font-size: var(--font-size-sm); color: var(--gray-600);">${escapeHtml(review.worker_reply)}</p>
        </div>
      ` : `
        <button class="btn btn-outline btn-sm" onclick="replyToReview('${review.id}')">Reply</button>
      `}
    </div>
  `;
}

async function replyToReview(reviewId) {
  const replyText = await modal.prompt('Reply to Review', 'Write your reply:', 'Your reply...');
  if (!replyText) return;

  try {
    await api.put(`/reviews/${reviewId}/reply`, { worker_reply: replyText });
    toast.success('Reply submitted');
    initReviews();
  } catch (err) {
    toast.error(friendlyError(err));
  }
}
window.replyToReview = replyToReview;

// ==========================================
// HELPERS
// ==========================================
function setupHeader() {
  const user = auth.getUser();
  const nameEl = document.getElementById('header-user-name');
  if (nameEl && user) nameEl.textContent = user.full_name;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); auth.logout(); });

  // Active nav
  const path = window.location.pathname;
  document.querySelectorAll('.header-nav a').forEach(link => {
    if (link.getAttribute('href') && path.includes(link.getAttribute('href'))) {
      link.style.fontWeight = '600';
      link.style.color = 'var(--indigo)';
    }
  });
}

function setStatValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<span class="stat-value">${value}</span>`;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setFormValue(name, value) {
  const el = document.querySelector(`[name="${name}"]`);
  if (el) el.value = value || '';
}
