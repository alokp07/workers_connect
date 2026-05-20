const skeleton = {
  card(count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="card" style="padding: var(--space-6);">
          <div class="skeleton skeleton-avatar" style="margin-bottom: 12px;"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text" style="width: 80%;"></div>
          <div class="skeleton skeleton-text" style="width: 60%;"></div>
        </div>
      `;
    }
    return html;
  },

  table(rows = 5, cols = 4) {
    let html = '<div class="table-container"><table class="table"><thead><tr>';
    for (let c = 0; c < cols; c++) {
      html += `<th><div class="skeleton skeleton-text" style="width: 80px;"></div></th>`;
    }
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += `<td><div class="skeleton skeleton-text" style="width: ${60 + Math.random() * 40}%;"></div></td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    return html;
  },

  stat(count = 4) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="stat-card">
          <div class="skeleton" style="width: 48px; height: 48px; border-radius: 12px;"></div>
          <div>
            <div class="skeleton" style="width: 60px; height: 28px; margin-bottom: 4px;"></div>
            <div class="skeleton skeleton-text" style="width: 80px;"></div>
          </div>
        </div>
      `;
    }
    return html;
  },
};
