const validators = {
  required(value, label = 'Field') {
    if (!value || !value.toString().trim()) return `${label} is required`;
    return null;
  },

  email(value) {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
    return null;
  },

  password(value) {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  phone(value) {
    if (!value) return null;
    if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) return 'Phone must be 10 digits';
    return null;
  },

  minLength(value, min, label = 'Field') {
    if (value && value.length < min) return `${label} must be at least ${min} characters`;
    return null;
  },
};

function validateForm(rules) {
  const errors = {};
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const error = rule();
      if (error) {
        errors[field] = error;
        isValid = false;
        break;
      }
    }
  }

  // Show errors on form
  document.querySelectorAll('.form-error').forEach(el => el.remove());
  document.querySelectorAll('.form-input.error, .form-select.error, .form-textarea.error')
    .forEach(el => el.classList.remove('error'));

  for (const [field, message] of Object.entries(errors)) {
    const input = document.querySelector(`[name="${field}"]`);
    if (input) {
      input.classList.add('error');
      const errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      errorEl.textContent = message;
      input.parentNode.appendChild(errorEl);
    }
  }

  return isValid;
}

function clearValidation() {
  document.querySelectorAll('.form-error').forEach(el => el.remove());
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}
