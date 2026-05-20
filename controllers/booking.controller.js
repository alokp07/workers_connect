const supabase = require('../config/supabase');
const { success, paginated } = require('../utils/response');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { logActivity } = require('../utils/logger');

async function createBooking(req, res) {
  const { worker_id, category_id, description, location, preferred_date, preferred_time } = req.body;

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_id: req.user.id,
      worker_id,
      category_id: category_id || null,
      description,
      location: location || '',
      preferred_date: preferred_date || null,
      preferred_time: preferred_time || null,
      status: 'pending',
    })
    .select(`
      *,
      worker:users!bookings_worker_id_fkey(id, full_name, avatar_url),
      client:users!bookings_client_id_fkey(id, full_name, avatar_url),
      category:service_categories(id, name, icon)
    `)
    .single();

  if (error) throw new BadRequestError(error.message);

  await logActivity(req.user.id, 'booking_created', `New booking for worker ${worker_id}`, { booking_id: data.id });
  return success(res, data, 'Booking created', 201);
}

async function getBookings(req, res) {
  const { status, page = 1, limit = 10 } = req.query;
  const role = req.user.role;

  let query = supabase
    .from('bookings')
    .select(`
      *,
      worker:users!bookings_worker_id_fkey(id, full_name, avatar_url),
      client:users!bookings_client_id_fkey(id, full_name, avatar_url),
      category:service_categories(id, name, icon),
      review:reviews(id, rating)
    `, { count: 'exact' });

  if (role === 'client') query = query.eq('client_id', req.user.id);
  else if (role === 'worker') query = query.eq('worker_id', req.user.id);

  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false });

  const offset = (parseInt(page) - 1) * parseInt(limit);
  query = query.range(offset, offset + parseInt(limit) - 1);

  const { data, error, count } = await query;
  if (error) throw new BadRequestError(error.message);

  return paginated(res, data, count, page, limit);
}

async function updateBookingStatus(req, res, newStatus) {
  const { id } = req.params;
  const { decline_reason } = req.body || {};

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (!booking) throw new NotFoundError('Booking not found');

  // Permission checks
  if (['accepted', 'declined', 'completed'].includes(newStatus) && booking.worker_id !== req.user.id) {
    throw new ForbiddenError('Only the assigned worker can perform this action');
  }
  if (newStatus === 'cancelled' && booking.client_id !== req.user.id) {
    throw new ForbiddenError('Only the client can cancel');
  }

  // Status flow validation
  const validTransitions = {
    accepted: ['pending'],
    declined: ['pending'],
    completed: ['accepted'],
    cancelled: ['pending'],
  };
  if (!validTransitions[newStatus]?.includes(booking.status)) {
    throw new BadRequestError(`Cannot change status from ${booking.status} to ${newStatus}`);
  }

  const updates = { status: newStatus };
  if (newStatus === 'declined' && decline_reason) updates.decline_reason = decline_reason;

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      worker:users!bookings_worker_id_fkey(id, full_name, avatar_url),
      client:users!bookings_client_id_fkey(id, full_name, avatar_url),
      category:service_categories(id, name, icon)
    `)
    .single();

  if (error) throw new BadRequestError(error.message);

  await logActivity(req.user.id, `booking_${newStatus}`, `Booking ${id} ${newStatus}`, { booking_id: id });
  return success(res, data, `Booking ${newStatus}`);
}

async function acceptBooking(req, res) { return updateBookingStatus(req, res, 'accepted'); }
async function declineBooking(req, res) { return updateBookingStatus(req, res, 'declined'); }
async function completeBooking(req, res) { return updateBookingStatus(req, res, 'completed'); }
async function cancelBooking(req, res) { return updateBookingStatus(req, res, 'cancelled'); }

module.exports = { createBooking, getBookings, acceptBooking, declineBooking, completeBooking, cancelBooking };
