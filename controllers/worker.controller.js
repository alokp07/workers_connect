const supabase = require('../config/supabase');
const { success, paginated } = require('../utils/response');
const { BadRequestError, NotFoundError } = require('../utils/errors');

async function getWorkers(req, res) {
  const { category, location, min_rating, sort, page = 1, limit = 12, search } = req.query;

  let query = supabase
    .from('worker_profiles')
    .select(`
      *,
      user:users(id, full_name, email, phone, avatar_url),
      category:service_categories(id, name, slug, icon)
    `, { count: 'exact' })
    .eq('availability', true);

  // Only show approved workers
  const { data: approvedIds } = await supabase
    .from('worker_approval_requests')
    .select('user_id')
    .eq('status', 'approved');

  if (approvedIds && approvedIds.length > 0) {
    query = query.in('user_id', approvedIds.map(a => a.user_id));
  } else {
    return paginated(res, [], 0, page, limit);
  }

  if (category) query = query.eq('category_id', category);
  if (location) query = query.ilike('location', `%${location}%`);
  if (min_rating) query = query.gte('avg_rating', parseFloat(min_rating));
  if (search) {
    query = query.or(`bio.ilike.%${search}%,skills.cs.{${search}}`);
  }

  if (sort === 'rating') {
    query = query.order('avg_rating', { ascending: false });
  } else if (sort === 'experience') {
    query = query.order('years_experience', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  query = query.range(offset, offset + parseInt(limit) - 1);

  const { data, error, count } = await query;
  if (error) throw new BadRequestError(error.message);

  return paginated(res, data, count, page, limit);
}

async function getWorkerById(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('worker_profiles')
    .select(`
      *,
      user:users(id, full_name, email, phone, avatar_url),
      category:service_categories(id, name, slug, icon)
    `)
    .eq('user_id', id)
    .single();

  if (error || !data) throw new NotFoundError('Worker not found');

  // Get reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      client:users!reviews_client_id_fkey(id, full_name, avatar_url)
    `)
    .eq('worker_id', id)
    .order('created_at', { ascending: false });

  return success(res, { ...data, reviews: reviews || [] });
}

async function getMyProfile(req, res) {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select(`
      *,
      user:users(id, full_name, email, phone, avatar_url),
      category:service_categories(id, name, slug, icon)
    `)
    .eq('user_id', req.user.id)
    .single();

  if (error || !data) throw new NotFoundError('Profile not found');
  return success(res, data);
}

async function updateMyProfile(req, res) {
  const { bio, skills, years_experience, location, portfolio_urls, availability, category_id } = req.body;

  const updates = {};
  if (bio !== undefined) updates.bio = bio;
  if (skills !== undefined) updates.skills = skills;
  if (years_experience !== undefined) updates.years_experience = years_experience;
  if (location !== undefined) updates.location = location;
  if (portfolio_urls !== undefined) updates.portfolio_urls = portfolio_urls;
  if (availability !== undefined) updates.availability = availability;
  if (category_id !== undefined) updates.category_id = category_id;

  const { data, error } = await supabase
    .from('worker_profiles')
    .update(updates)
    .eq('user_id', req.user.id)
    .select(`
      *,
      user:users(id, full_name, email, phone, avatar_url),
      category:service_categories(id, name, slug, icon)
    `)
    .single();

  if (error) throw new BadRequestError(error.message);
  return success(res, data, 'Profile updated');
}

async function getApprovalStatus(req, res) {
  const { data, error } = await supabase
    .from('worker_approval_requests')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error || !data) throw new NotFoundError('No approval request found');
  return success(res, data);
}

module.exports = { getWorkers, getWorkerById, getMyProfile, updateMyProfile, getApprovalStatus };
