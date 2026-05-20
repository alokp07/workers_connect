const supabase = require('../config/supabase');
const { success } = require('../utils/response');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { logActivity } = require('../utils/logger');

async function createReview(req, res) {
  const { booking_id, rating, comment } = req.body;

  // Verify booking exists and is completed
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', booking_id)
    .eq('client_id', req.user.id)
    .eq('status', 'completed')
    .single();

  if (!booking) throw new BadRequestError('Booking not found or not completed');

  // Check for existing review
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', booking_id)
    .single();

  if (existing) throw new BadRequestError('Review already submitted for this booking');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      booking_id,
      client_id: req.user.id,
      worker_id: booking.worker_id,
      rating,
      comment: comment || '',
    })
    .select(`
      *,
      client:users!reviews_client_id_fkey(id, full_name, avatar_url)
    `)
    .single();

  if (error) throw new BadRequestError(error.message);

  await logActivity(req.user.id, 'review_created', `Review for booking ${booking_id}`, {
    booking_id,
    rating,
    worker_id: booking.worker_id,
  });

  return success(res, data, 'Review submitted', 201);
}

async function replyToReview(req, res) {
  const { id } = req.params;
  const { worker_reply } = req.body;

  const { data: review } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .eq('worker_id', req.user.id)
    .single();

  if (!review) throw new NotFoundError('Review not found');
  if (review.worker_reply) throw new BadRequestError('Already replied to this review');

  const { data, error } = await supabase
    .from('reviews')
    .update({ worker_reply, worker_replied_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new BadRequestError(error.message);
  return success(res, data, 'Reply submitted');
}

async function getWorkerReviews(req, res) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      client:users!reviews_client_id_fkey(id, full_name, avatar_url),
      booking:bookings(id, description, category:service_categories(name, icon))
    `)
    .eq('worker_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) throw new BadRequestError(error.message);
  return success(res, data);
}

module.exports = { createReview, replyToReview, getWorkerReviews };
