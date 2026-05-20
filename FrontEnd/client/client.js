// Client page logic - path-based routing
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('login.html')) initLogin();
  else if (path.includes('register.html')) initRegister();
  else if (path.includes('worker-profile.html')) initWorkerProfile();
  else if (path.includes('book.html')) initBookForm();
  else if (path.includes('dashboard.html')) initDashboard();
  else if (path.includes('bookings.html')) initBookings();
  else if (path.includes('review.html')) initReviewForm();
});

// ==========================================
// LOGIN
// ==========================================
function initLogin() {
  const form = document.getElementById('login-form');
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
      if (res.data.user.role !== 'client') {
        toast.error('This login is for clients only');
        btn.disabled = false;
        btn.textContent = 'Sign In';
        return;
      }
      auth.setAuth(res.data.token, res.data.user);
      toast.success('Login successful!');
      window.location.href = '/client/dashboard.html';
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}

// ==========================================
// REGISTER
// ==========================================
function initRegister() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearValidation();

    const data = {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      password: form.password.value,
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
      const res = await api.post('/auth/register/client', data);
      auth.setAuth(res.data.token, res.data.user);
      toast.success('Registration successful!');
      window.location.href = '/client/dashboard.html';
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
}

// ==========================================
// DASHBOARD - Browse Workers
// ==========================================
let workersPage = 1;
let workersFilters = {};

async function initDashboard() {
  setupHeader();
  await loadCategoryFilter();
  setupDashboardFilters();
  await loadWorkers();
}

async function loadCategoryFilter() {
  try {
    const res = await api.get('/categories');
    const select = document.getElementById('category-filter');
    if (!select) return;
    res.data.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = `${cat.icon} ${cat.name}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
  }
}

function setupDashboardFilters() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const locationFilter = document.getElementById('location-filter');
  const ratingFilter = document.getElementById('rating-filter');
  const sortFilter = document.getElementById('sort-filter');

  const applyFilters = debounce(() => {
    workersPage = 1;
    workersFilters = {};
    if (searchInput?.value) workersFilters.search = searchInput.value;
    if (categoryFilter?.value) workersFilters.category = categoryFilter.value;
    if (locationFilter?.value) workersFilters.location = locationFilter.value;
    if (ratingFilter?.value) workersFilters.min_rating = ratingFilter.value;
    if (sortFilter?.value) workersFilters.sort = sortFilter.value;
    loadWorkers();
  }, 400);

  [searchInput, locationFilter].forEach(el => {
    if (el) el.addEventListener('input', applyFilters);
  });
  [categoryFilter, ratingFilter, sortFilter].forEach(el => {
    if (el) el.addEventListener('change', applyFilters);
  });
}

async function loadWorkers() {
  try {
    let url = `/workers?page=${workersPage}&limit=12`;
    Object.entries(workersFilters).forEach(([k, v]) => {
      if (v) url += `&${k}=${encodeURIComponent(v)}`;
    });

    const res = await api.get(url);
    const container = document.getElementById('workers-grid');
    const emptyState = document.getElementById('empty-state');

    if (res.data.length === 0) {
      if (container) container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (container) container.innerHTML = res.data.map(renderWorkerCard).join('');
    }

    renderPagination('pagination-container', res.pagination, (page) => {
      workersPage = page;
      loadWorkers();
    });
  } catch (err) {
    toast.error('Failed to load workers');
  }
}

function renderWorkerCard(worker) {
  const user = worker.user || {};
  const category = worker.category || {};
  return `
    <div class="worker-card hover-lift animate-fadeInUp">
      <div class="worker-card-header">
        ${renderAvatar(user, 'avatar-lg')}
        <div class="worker-card-info">
          <h3>${escapeHtml(user.full_name)}</h3>
          <span class="category">${category.icon || ''} ${escapeHtml(category.name || 'General')}</span>
        </div>
      </div>
      <div class="worker-card-body">
        <p class="worker-card-bio">${escapeHtml(worker.bio || 'No bio available')}</p>
        <div class="worker-card-meta">
          ${worker.location ? `<span>📍 ${escapeHtml(worker.location)}</span>` : ''}
          <span>💼 ${worker.years_experience || 0} yrs exp</span>
          <span>${renderStars(worker.avg_rating)}</span>
        </div>
      </div>
      <div class="worker-card-footer">
        <div class="skills-list">
          ${(worker.skills || []).slice(0, 3).map(s => `<span class="tag tag-indigo">${escapeHtml(s)}</span>`).join('')}
        </div>
        <a href="/client/worker-profile.html?id=${user.id}" class="btn btn-primary btn-sm">View Profile</a>
      </div>
    </div>
  `;
}

// ==========================================
// WORKER PROFILE VIEW
// ==========================================
async function initWorkerProfile() {
  setupHeader();
  const workerId = getUrlParam('id');
  if (!workerId) { window.location.href = '/client/dashboard.html'; return; }

  try {
    const res = await api.get(`/workers/${workerId}`);
    const data = res.data;
    const user = data.user || {};
    const category = data.category || {};

    // Header
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) avatarEl.innerHTML = renderAvatar(user, 'avatar-xl');
    setText('profile-name', user.full_name);
    setText('profile-category', `${category.icon || ''} ${category.name || 'General'}`);
    setText('profile-location', data.location || 'Not specified');
    setText('profile-experience', `${data.years_experience || 0} years experience`);

    const availBadge = document.getElementById('profile-availability');
    if (availBadge) {
      availBadge.className = `badge ${data.availability ? 'badge-approved' : 'badge-declined'}`;
      availBadge.textContent = data.availability ? 'Available' : 'Unavailable';
    }

    // Stats
    setText('stat-rating-value', Number(data.avg_rating).toFixed(1));
    const ratingStars = document.getElementById('stat-rating-stars');
    if (ratingStars) ratingStars.innerHTML = renderStars(data.avg_rating);
    setText('stat-reviews-value', data.total_reviews || 0);
    setText('stat-experience-value', data.years_experience || 0);

    // Remove skeleton classes now that data is loaded
    ['profile-name','profile-category','profile-location','profile-experience',
     'stat-rating-value','stat-reviews-value','stat-experience-value'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('skeleton', 'skeleton-title', 'skeleton-text');
    });

    // Bio
    setText('bio-content', data.bio || 'No bio available');

    // Skills
    const skillsList = document.getElementById('skills-list');
    if (skillsList) {
      skillsList.innerHTML = (data.skills || []).map(s =>
        `<span class="tag tag-indigo">${escapeHtml(s)}</span>`
      ).join('') || '<span class="tag">No skills listed</span>';
    }

    // Portfolio
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (portfolioGrid) {
      const urls = data.portfolio_urls || [];
      if (urls.length > 0) {
        portfolioGrid.innerHTML = urls.map(url =>
          `<div class="portfolio-item"><a href="${escapeHtml(url.match(/^https?:\/\//) ? url : 'https://' + url)}" target="_blank" style="color:var(--indigo);padding:var(--space-4);display:block;word-break:break-all;">${escapeHtml(url)}</a></div>`
        ).join('');
      } else {
        portfolioGrid.innerHTML = '<p style="color:var(--gray-400);">No portfolio items</p>';
      }
    }

    // Hire button
    const hireBtn = document.getElementById('hire-btn');
    if (hireBtn) {
      if (data.availability) {
        hireBtn.href = `/client/book.html?worker_id=${user.id}`;
        hireBtn.style.display = 'inline-flex';
      } else {
        hireBtn.style.display = 'none';
      }
    }

    // Reviews
    const reviewsList = document.getElementById('reviews-list');
    const reviewsEmpty = document.getElementById('reviews-empty');

    if (data.reviews && data.reviews.length > 0) {
      if (reviewsEmpty) reviewsEmpty.style.display = 'none';
      if (reviewsList) reviewsList.innerHTML = data.reviews.map(r => {
        const c = r.client || {};
        return `
          <div class="review-card">
            <div class="review-card-header">
              <div class="review-card-user">
                ${renderAvatar(c)}
                <div>
                  <strong>${escapeHtml(c.full_name || 'Client')}</strong>
                  <div style="font-size:var(--font-size-xs);color:var(--gray-400);">${timeAgo(r.created_at)}</div>
                </div>
              </div>
              <div>${renderStars(r.rating)}</div>
            </div>
            <div class="review-card-comment">${escapeHtml(r.comment)}</div>
            ${r.worker_reply ? `
              <div class="review-card-reply">
                <div class="review-card-reply-label">Worker Reply</div>
                <p style="margin:0;font-size:var(--font-size-sm);color:var(--gray-600);">${escapeHtml(r.worker_reply)}</p>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    } else {
      if (reviewsList) reviewsList.innerHTML = '';
      if (reviewsEmpty) reviewsEmpty.style.display = 'block';
    }
  } catch (err) {
    toast.error('Failed to load worker profile');
    console.error(err);
  }
}

// ==========================================
// BOOKING FORM
// ==========================================
async function initBookForm() {
  setupHeader();
  const workerId = getUrlParam('worker_id');
  if (!workerId) { window.location.href = '/client/dashboard.html'; return; }

  // Load worker preview
  try {
    const res = await api.get(`/workers/${workerId}`);
    const user = res.data.user || {};
    const category = res.data.category || {};
    const preview = document.getElementById('worker-preview');
    if (preview) {
      preview.innerHTML = `
        <div class="flex-gap" style="margin-bottom: var(--space-4);">
          ${renderAvatar(user, 'avatar-lg')}
          <div>
            <h3>${escapeHtml(user.full_name)}</h3>
            <span style="color:var(--gray-500);">${category.icon || ''} ${escapeHtml(category.name || '')}</span>
          </div>
        </div>
      `;
    }

    const backLink = document.getElementById('back-to-profile');
    if (backLink) backLink.href = `/client/worker-profile.html?id=${workerId}`;
  } catch (err) {
    toast.error('Failed to load worker info');
  }

  // Form submit
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearValidation();

    const data = {
      worker_id: workerId,
      description: form.description.value.trim(),
      preferred_date: form.preferred_date.value || null,
      preferred_time: form.preferred_time.value || null,
      location: form.location.value.trim(),
    };

    const valid = validateForm({
      description: [() => validators.required(data.description, 'Description')],
    });
    if (!valid) return;

    const btn = document.getElementById('submit-booking-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
      await api.post('/bookings', data);
      toast.success('Booking submitted successfully!');
      setTimeout(() => window.location.href = '/client/bookings.html', 1500);
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false;
      btn.textContent = 'Submit Booking';
    }
  });
}

// ==========================================
// BOOKINGS
// ==========================================
let clientBookingsPage = 1;
let clientBookingsFilter = '';

async function initBookings() {
  setupHeader();
  setupBookingTabs();
  await loadBookings();
}

function setupBookingTabs() {
  document.querySelectorAll('.tab[data-status]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab[data-status]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      clientBookingsFilter = tab.dataset.status || '';
      clientBookingsPage = 1;
      loadBookings();
    });
  });
}

async function loadBookings() {
  try {
    let url = `/bookings?page=${clientBookingsPage}&limit=10`;
    if (clientBookingsFilter) url += `&status=${clientBookingsFilter}`;

    const res = await api.get(url);
    const container = document.getElementById('bookings-list');
    const emptyState = document.getElementById('bookings-empty');

    if (res.data.length === 0) {
      if (container) container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (container) container.innerHTML = res.data.map(renderClientBookingCard).join('');
    }

    renderPagination('pagination-container', res.pagination, (page) => {
      clientBookingsPage = page;
      loadBookings();
    });
  } catch (err) {
    toast.error('Failed to load bookings');
  }
}

function renderClientBookingCard(booking) {
  const worker = booking.worker || {};
  const hasReview = booking.review && booking.review.length > 0;
  return `
    <div class="booking-card animate-fadeInUp">
      <div class="booking-card-header">
        <div class="flex-gap">
          ${renderAvatar(worker)}
          <div>
            <h4>${escapeHtml(worker.full_name || 'Worker')}</h4>
            ${booking.category ? `<span style="font-size:var(--font-size-xs);color:var(--gray-500);">${booking.category.icon} ${booking.category.name}</span>` : ''}
          </div>
        </div>
        ${statusBadge(booking.status)}
      </div>
      <div class="booking-card-body">${escapeHtml(booking.description)}</div>
      <div class="booking-card-details">
        ${booking.preferred_date ? `<span>📅 ${formatDate(booking.preferred_date)}</span>` : ''}
        ${booking.preferred_time ? `<span>🕐 ${booking.preferred_time}</span>` : ''}
        ${booking.location ? `<span>📍 ${escapeHtml(booking.location)}</span>` : ''}
        <span>Created ${timeAgo(booking.created_at)}</span>
      </div>
      <div class="booking-card-actions">
        ${booking.status === 'pending' ? `
          <button class="btn btn-danger btn-sm" onclick="cancelBooking('${booking.id}')">Cancel</button>
        ` : ''}
        ${booking.status === 'completed' && !hasReview ? `
          <a href="/client/review.html?booking_id=${booking.id}" class="btn btn-primary btn-sm">Leave Review</a>
        ` : ''}
        ${hasReview ? '<span class="badge badge-completed">Reviewed</span>' : ''}
      </div>
    </div>
  `;
}

async function cancelBooking(bookingId) {
  const confirmed = await modal.confirm('Cancel Booking', 'Are you sure you want to cancel this booking?', 'Yes, cancel');
  if (!confirmed) return;

  try {
    await api.put(`/bookings/${bookingId}/cancel`);
    toast.success('Booking cancelled');
    loadBookings();
  } catch (err) {
    toast.error(err.message);
  }
}
window.cancelBooking = cancelBooking;

// ==========================================
// REVIEW FORM
// ==========================================
async function initReviewForm() {
  setupHeader();
  const bookingId = getUrlParam('booking_id');
  if (!bookingId) { window.location.href = '/client/bookings.html'; return; }

  // Load booking summary
  try {
    const res = await api.get('/bookings');
    const booking = res.data.find(b => b.id === bookingId);
    if (!booking || booking.status !== 'completed') {
      toast.error('Invalid booking');
      window.location.href = '/client/bookings.html';
      return;
    }

    const summary = document.getElementById('booking-summary');
    if (summary) {
      const worker = booking.worker || {};
      summary.innerHTML = `
        <div class="flex-gap" style="margin-bottom:var(--space-4);">
          ${renderAvatar(worker, 'avatar-lg')}
          <div>
            <h3>${escapeHtml(worker.full_name || 'Worker')}</h3>
            ${booking.category ? `<span style="color:var(--gray-500);">${booking.category.icon} ${booking.category.name}</span>` : ''}
          </div>
        </div>
        <p style="color:var(--gray-600);font-size:var(--font-size-sm);">${escapeHtml(booking.description)}</p>
      `;
    }
  } catch (err) {
    toast.error('Failed to load booking');
    return;
  }

  // Star rating
  let selectedRating = 0;
  const starContainer = document.getElementById('star-rating');
  const ratingInput = document.getElementById('rating');

  if (starContainer) {
    const stars = starContainer.querySelectorAll('.star');
    stars.forEach(star => {
      star.addEventListener('mouseenter', () => {
        const val = parseInt(star.dataset.value);
        stars.forEach(s => {
          s.classList.toggle('hover', parseInt(s.dataset.value) <= val);
        });
      });

      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover'));
      });

      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.value);
        if (ratingInput) ratingInput.value = selectedRating;
        stars.forEach(s => {
          s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
        });
      });
    });
  }

  // Submit
  const form = document.getElementById('review-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (selectedRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    const data = {
      booking_id: bookingId,
      rating: selectedRating,
      comment: form.comment.value.trim(),
    };

    const btn = document.getElementById('submit-review-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
      await api.post('/reviews', data);
      toast.success('Review submitted successfully!');
      setTimeout(() => window.location.href = '/client/bookings.html', 1500);
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false;
      btn.textContent = 'Submit Review';
    }
  });
}

// ==========================================
// HELPERS
// ==========================================
function setupHeader() {
  const user = auth.getUser();
  const nameEl = document.getElementById('header-user-name');
  if (nameEl && user) nameEl.textContent = user.full_name;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); auth.logout(); });

  const path = window.location.pathname;
  document.querySelectorAll('.header-nav a').forEach(link => {
    if (link.getAttribute('href') && path.includes(link.getAttribute('href'))) {
      link.style.fontWeight = '600';
      link.style.color = 'var(--indigo)';
    }
  });
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
