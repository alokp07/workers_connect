const API_BASE = window.location.origin + '/api';

const ROLES = { CLIENT: 'client', WORKER: 'worker', ADMIN: 'admin' };

const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
};

const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const LS_KEYS = {
  TOKEN: 'wc_token',
  USER: 'wc_user',
};

const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  completed: 'Completed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  approved: 'Approved',
  rejected: 'Rejected',
};

const STATUS_COLORS = {
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  completed: 'badge-completed',
  declined: 'badge-declined',
  cancelled: 'badge-cancelled',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
};
