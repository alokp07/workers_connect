const modal = {
  confirm(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" data-action="cancel">&times;</button>
          </div>
          <div class="modal-body">
            <p style="margin-bottom:0; color: var(--gray-600);">${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" data-action="cancel">${cancelText}</button>
            <button class="btn btn-primary" data-action="confirm">${confirmText}</button>
          </div>
        </div>
      `;

      overlay.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'confirm') { overlay.remove(); resolve(true); }
        else if (action === 'cancel') { overlay.remove(); resolve(false); }
        else if (e.target === overlay) { overlay.remove(); resolve(false); }
      });

      document.body.appendChild(overlay);
    });
  },

  prompt(title, message, placeholder = '', defaultValue = '') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" data-action="cancel">&times;</button>
          </div>
          <div class="modal-body">
            <p style="color: var(--gray-600);">${message}</p>
            <textarea class="form-textarea" placeholder="${placeholder}" rows="3">${defaultValue}</textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="confirm">Submit</button>
          </div>
        </div>
      `;

      const textarea = overlay.querySelector('textarea');
      overlay.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'confirm') { overlay.remove(); resolve(textarea.value); }
        else if (action === 'cancel') { overlay.remove(); resolve(null); }
        else if (e.target === overlay) { overlay.remove(); resolve(null); }
      });

      document.body.appendChild(overlay);
      textarea.focus();
    });
  },

  form(title, fields) {
    return new Promise((resolve) => {
      let fieldsHtml = fields.map(f => `
        <div class="form-group">
          <label class="form-label">${f.label}</label>
          ${f.type === 'textarea'
            ? `<textarea class="form-textarea" name="${f.name}" placeholder="${f.placeholder || ''}">${f.value || ''}</textarea>`
            : f.type === 'select'
              ? `<select class="form-select" name="${f.name}">${f.options.map(o =>
                  `<option value="${o.value}" ${o.value === f.value ? 'selected' : ''}>${o.label}</option>`
                ).join('')}</select>`
              : `<input class="form-input" type="${f.type || 'text'}" name="${f.name}" value="${f.value || ''}" placeholder="${f.placeholder || ''}">`
          }
        </div>
      `).join('');

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" data-action="cancel">&times;</button>
          </div>
          <div class="modal-body">
            <form id="modal-form">${fieldsHtml}</form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="confirm">Save</button>
          </div>
        </div>
      `;

      overlay.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'confirm') {
          const form = overlay.querySelector('#modal-form');
          const data = Object.fromEntries(new FormData(form));
          overlay.remove();
          resolve(data);
        } else if (action === 'cancel' || e.target === overlay) {
          overlay.remove();
          resolve(null);
        }
      });

      document.body.appendChild(overlay);
    });
  },
};
