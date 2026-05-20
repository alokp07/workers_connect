const supabase = require('../config/supabase');
const { success, paginated } = require('../utils/response');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const { logActivity } = require('../utils/logger');

async function getStats(req, res) {
  const [users, workers, bookings, reviews] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('worker_approval_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
  ]);

  const { data: recentActivity } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return success(res, {
    total_users: users.count || 0,
    pending_approvals: workers.count || 0,
    total_bookings: bookings.count || 0,
    total_reviews: reviews.count || 0,
    recent_activity: recentActivity || [],
  });
}

async function getApprovals(req, res) {
  const { status = 'pending', page = 1, limit = 10 } = req.query;

  let query = supabase
    .from('worker_approval_requests')
    .select(`
      *,
      user:users!worker_approval_requests_user_id_fkey(id, full_name, email, phone, avatar_url, created_at)
    `, { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false });

  const offset = (parseInt(page) - 1) * parseInt(limit);
  query = query.range(offset, offset + parseInt(limit) - 1);

  const { data, error, count } = await query;
  if (error) throw new BadRequestError(error.message);

  // Fetch worker profiles separately
  const enriched = await Promise.all((data || []).map(async (item) => {
    const { data: profile } = await supabase
      .from('worker_profiles')
      .select('bio, skills, years_experience, location, category:service_categories(name, icon)')
      .eq('user_id', item.user_id)
      .single();
    return { ...item, profile: profile || {} };
  }));

  return paginated(res, enriched, count, page, limit);
}

async function updateApproval(req, res) {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new BadRequestError('Status must be approved or rejected');
  }

  const { data, error } = await supabase
    .from('worker_approval_requests')
    .update({ status, admin_notes: admin_notes || null, reviewed_by: req.user.id })
    .eq('id', id)
    .select(`*, user:users!worker_approval_requests_user_id_fkey(id, full_name, email)`)
    .single();

  if (error) throw new NotFoundError('Approval request not found');

  await logActivity(req.user.id, `worker_${status}`, `Worker ${data.user.full_name} ${status}`, {
    approval_id: id,
    worker_id: data.user_id,
  });

  return success(res, data, `Worker ${status}`);
}

async function getUsers(req, res) {
  const { role, search, page = 1, limit = 20 } = req.query;

  let query = supabase
    .from('users')
    .select('id, email, full_name, phone, avatar_url, role, is_blocked, created_at', { count: 'exact' });

  if (role) query = query.eq('role', role);
  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  query = query.order('created_at', { ascending: false });

  const offset = (parseInt(page) - 1) * parseInt(limit);
  query = query.range(offset, offset + parseInt(limit) - 1);

  const { data, error, count } = await query;
  if (error) throw new BadRequestError(error.message);

  return paginated(res, data, count, page, limit);
}

async function toggleBlockUser(req, res) {
  const { id } = req.params;

  const { data: user } = await supabase
    .from('users')
    .select('id, is_blocked, full_name')
    .eq('id', id)
    .single();

  if (!user) throw new NotFoundError('User not found');

  const { data, error } = await supabase
    .from('users')
    .update({ is_blocked: !user.is_blocked })
    .eq('id', id)
    .select('id, email, full_name, is_blocked')
    .single();

  if (error) throw new BadRequestError(error.message);

  const action = data.is_blocked ? 'blocked' : 'unblocked';
  await logActivity(req.user.id, `user_${action}`, `User ${data.full_name} ${action}`, { target_user_id: id });
  return success(res, data, `User ${action}`);
}

async function getAllBookings(req, res) {
  const { status, page = 1, limit = 20 } = req.query;

  let query = supabase
    .from('bookings')
    .select(`
      *,
      worker:users!bookings_worker_id_fkey(id, full_name),
      client:users!bookings_client_id_fkey(id, full_name),
      category:service_categories(id, name, icon)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const offset = (parseInt(page) - 1) * parseInt(limit);
  query = query.range(offset, offset + parseInt(limit) - 1);

  const { data, error, count } = await query;
  if (error) throw new BadRequestError(error.message);

  return paginated(res, data, count, page, limit);
}

async function getAllReviews(req, res) {
  const { page = 1, limit = 20 } = req.query;

  const { data, error, count } = await supabase
    .from('reviews')
    .select(`
      *,
      client:users!reviews_client_id_fkey(id, full_name),
      worker:users!reviews_worker_id_fkey(id, full_name),
      booking:bookings(id, description)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit) - 1);

  if (error) throw new BadRequestError(error.message);
  return paginated(res, data, count, page, limit);
}

async function deleteReview(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw new NotFoundError('Review not found');
  await logActivity(req.user.id, 'review_deleted', `Review ${id} removed by admin`, { review_id: id });
  return success(res, null, 'Review deleted');
}

async function getActivityLog(req, res) {
  const { page = 1, limit = 30 } = req.query;

  const { data, error, count } = await supabase
    .from('activity_logs')
    .select(`
      *,
      user:users(id, full_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit) - 1);

  if (error) throw new BadRequestError(error.message);
  return paginated(res, data, count, page, limit);
}

module.exports = {
  getStats, getApprovals, updateApproval,
  getUsers, toggleBlockUser,
  getAllBookings, getAllReviews, deleteReview, getActivityLog,
};
