const supabase = require('../config/supabase');

async function logActivity(userId, actionType, description, metadata = {}) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action_type: actionType,
      description,
      metadata,
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

module.exports = { logActivity };
