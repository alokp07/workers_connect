const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { JWT_SECRET } = require('../config/env');
const { success } = require('../utils/response');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');
const { logActivity } = require('../utils/logger');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function registerClient(req, res) {
  const { email, password, full_name, phone } = req.body;

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) throw new BadRequestError('Email already registered');

  const password_hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ email, password_hash, full_name, phone, role: 'client' })
    .select()
    .single();

  if (error) throw new BadRequestError(error.message);

  await logActivity(user.id, 'user_registered', `Client ${full_name} registered`);

  const token = generateToken(user);
  return success(res, { token, user: sanitizeUser(user) }, 'Registration successful', 201);
}

async function registerWorker(req, res) {
  const { email, password, full_name, phone, bio, category_id, skills, years_experience, location } = req.body;

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) throw new BadRequestError('Email already registered');

  const password_hash = await bcrypt.hash(password, 10);

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({ email, password_hash, full_name, phone, role: 'worker' })
    .select()
    .single();

  if (userError) throw new BadRequestError(userError.message);

  const { error: profileError } = await supabase
    .from('worker_profiles')
    .insert({
      user_id: user.id,
      category_id: category_id || null,
      bio: bio || '',
      skills: skills || [],
      years_experience: years_experience || 0,
      location: location || '',
    });

  if (profileError) throw new BadRequestError(profileError.message);

  const { error: approvalError } = await supabase
    .from('worker_approval_requests')
    .insert({ user_id: user.id, status: 'pending' });

  if (approvalError) throw new BadRequestError(approvalError.message);

  await logActivity(user.id, 'worker_registered', `Worker ${full_name} registered, pending approval`);

  const token = generateToken(user);
  return success(res, { token, user: sanitizeUser(user) }, 'Registration successful. Awaiting admin approval.', 201);
}

async function login(req, res) {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) throw new UnauthorizedError('Invalid email or password');
  if (user.is_blocked) throw new UnauthorizedError('Your account has been blocked');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  if (user.role === 'worker') {
    const { data: approval } = await supabase
      .from('worker_approval_requests')
      .select('status')
      .eq('user_id', user.id)
      .single();

    if (approval && approval.status !== 'approved') {
      const token = generateToken(user);
      return success(res, {
        token,
        user: sanitizeUser(user),
        approval_status: approval.status,
      }, 'Login successful');
    }
  }

  await logActivity(user.id, 'user_login', `${user.full_name} logged in`);

  const token = generateToken(user);
  return success(res, { token, user: sanitizeUser(user) }, 'Login successful');
}

async function getMe(req, res) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error || !user) throw new UnauthorizedError('User not found');

  let approval_status = null;
  if (user.role === 'worker') {
    const { data: approval } = await supabase
      .from('worker_approval_requests')
      .select('status')
      .eq('user_id', user.id)
      .single();
    approval_status = approval?.status || null;
  }

  return success(res, { user: sanitizeUser(user), approval_status });
}

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

module.exports = { registerClient, registerWorker, login, getMe };
