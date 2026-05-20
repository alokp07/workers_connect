function friendlyError(err) {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('password') || msg.includes('credentials') || msg.includes('incorrect')) return err.message;
  if (msg.includes('validation') || msg.includes('required') || msg.includes('must be') || msg.includes('invalid email')) return err.message;
  if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists') || msg.includes('primary key') || msg.includes('23505')) return 'This already exists. Please try a different value.';
  if (msg.includes('foreign key') || msg.includes('violates') || msg.includes('constraint') || msg.includes('23503')) return 'This action conflicts with existing data.';
  if (msg.includes('not found') || msg.includes('404')) return "We couldn't find what you're looking for.";
  if (msg.includes('unauthorized') || msg.includes('invalid token') || msg.includes('jwt') || msg.includes('401')) return 'Your session expired. Please sign in again.';
  if (msg.includes('forbidden') || msg.includes('permission') || msg.includes('403')) return "You don't have permission to do this.";
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('networkerror')) return 'Network issue. Please check your connection and try again.';
  if (msg.includes('this login is for')) return err.message;
  return "Something went wrong. We're already on it — please try again.";
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

function renderStars(rating, size = '') {
  let html = '<span class="stars">';
  for (let i = 1; i <= 5; i++) {
    html += i <= Math.round(rating)
      ? '<span>&#9733;</span>'
      : '<span class="star-empty">&#9733;</span>';
  }
  html += '</span>';
  if (rating > 0) html += ` <span style="font-size: var(--font-size-sm); color: var(--gray-500);">${Number(rating).toFixed(1)}</span>`;
  return html;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function renderAvatar(user, sizeClass = '') {
  if (user?.avatar_url) {
    return `<img src="${user.avatar_url}" alt="${user.full_name}" class="avatar ${sizeClass}">`;
  }
  return `<div class="avatar ${sizeClass}">${getInitials(user?.full_name)}</div>`;
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function getUrlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function setUrlParam(key, value) {
  const params = new URLSearchParams(window.location.search);
  if (value) params.set(key, value);
  else params.delete(key);
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

function renderPagination(containerId, pagination, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container || !pagination || pagination.totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  const { page, totalPages } = pagination;
  let html = '<div class="pagination">';
  html += `<button class="pagination-btn" ${page <= 1 ? 'disabled' : ''} onclick="window._paginate(${page - 1})">&laquo; Prev</button>`;

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  if (start > 1) html += `<button class="pagination-btn" onclick="window._paginate(1)">1</button>`;
  if (start > 2) html += `<span style="padding: 0 4px;">...</span>`;

  for (let i = start; i <= end; i++) {
    html += `<button class="pagination-btn ${i === page ? 'active' : ''}" onclick="window._paginate(${i})">${i}</button>`;
  }

  if (end < totalPages - 1) html += `<span style="padding: 0 4px;">...</span>`;
  if (end < totalPages) html += `<button class="pagination-btn" onclick="window._paginate(${totalPages})">${totalPages}</button>`;

  html += `<button class="pagination-btn" ${page >= totalPages ? 'disabled' : ''} onclick="window._paginate(${page + 1})">Next &raquo;</button>`;
  html += '</div>';

  container.innerHTML = html;
  window._paginate = onPageChange;
}

function statusBadge(status) {
  return `<span class="badge ${STATUS_COLORS[status] || ''}">${STATUS_LABELS[status] || status}</span>`;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
