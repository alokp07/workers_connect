const supabase = require('../config/supabase');
const { success } = require('../utils/response');
const { BadRequestError } = require('../utils/errors');

async function uploadAvatar(req, res) {
  if (!req.file) throw new BadRequestError('No file uploaded');

  const file = req.file;
  const ext = file.originalname.split('.').pop();
  const fileName = `avatars/${req.user.id}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) throw new BadRequestError(uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  // Update user avatar_url
  await supabase
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', req.user.id);

  return success(res, { url: publicUrl }, 'Avatar uploaded');
}

module.exports = { uploadAvatar };
