const supabase = require('../config/supabase');
const { success } = require('../utils/response');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const { logActivity } = require('../utils/logger');

async function getCategories(req, res) {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw new BadRequestError(error.message);
  return success(res, data);
}

async function getAllCategories(req, res) {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('name');

  if (error) throw new BadRequestError(error.message);
  return success(res, data);
}

async function createCategory(req, res) {
  const { name, icon } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const { data, error } = await supabase
    .from('service_categories')
    .insert({ name, slug, icon: icon || '🔧' })
    .select()
    .single();

  if (error) throw new BadRequestError(error.message);
  await logActivity(req.user.id, 'category_created', `Category "${name}" created`);
  return success(res, data, 'Category created', 201);
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, icon, is_active } = req.body;

  const updates = {};
  if (name !== undefined) {
    updates.name = name;
    updates.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  if (icon !== undefined) updates.icon = icon;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabase
    .from('service_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new NotFoundError('Category not found');
  await logActivity(req.user.id, 'category_updated', `Category "${data.name}" updated`);
  return success(res, data, 'Category updated');
}

async function deleteCategory(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw new NotFoundError('Category not found');
  await logActivity(req.user.id, 'category_deleted', `Category "${data.name}" deleted`);
  return success(res, null, 'Category deleted');
}

module.exports = { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory };
