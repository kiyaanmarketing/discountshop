const apiUrl = '/api';
let editHostname = '';

// toast helper (same as in manageApp.js)
function showToast(message, type='info', duration=3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, duration);
}

async function fetchTrackingUrls() {
  try {
    const response = await fetch(`${apiUrl}/tracking-urls`);
    if (!response.ok) throw new Error(`Fetch failed with status=> ${response.status}`);

    const data = await response.json();
    const tableBody = document.querySelector('#urls-table tbody');
    tableBody.innerHTML = '';

    data.forEach(({ hostname, affiliateUrl, status, tagUrl }) => {
      const tag = tagUrl || '';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${hostname}</td>
        <td>${affiliateUrl}</td>
        <td>${tag}</td>
        <td class="actions">
          <button class="toggle ${status==='active'?'active':'inactive'}" onclick="toggleStatus('${hostname}', '${status}')">
            <i class="fas ${status==='active'?'fa-check-circle':'fa-times-circle'}"></i>
            ${status.charAt(0).toUpperCase()+status.slice(1)}
          </button>
          <button class="edit" onclick="openEditModal('${hostname}', '${affiliateUrl}', '${status}')"><i class="fas fa-edit"></i>Edit</button>
          <button class="delete" onclick="deleteUrl('${hostname}')"><i class="fas fa-trash"></i>Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    showToast('Error fetching tracking URLs.', 'error');
  }
}

// Add URL
document.getElementById('submit-btn').addEventListener('click', async () => {
  const hostname = document.getElementById('hostname').value.trim();
  const affiliateUrl = document.getElementById('affiliateUrl').value.trim();
  const tagUrl = document.getElementById('tagUrl')?.value.trim() || '';
  const status = document.getElementById('status').value;

  if (!hostname || !affiliateUrl) {
    showToast('Please fill all fields.', 'error');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/add-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostname, affiliateUrl, tagUrl, status }),
    });

    const data = await response.json();
    showToast(data.message, 'success');
    fetchTrackingUrls();
    document.getElementById('hostname').value = '';
    document.getElementById('affiliateUrl').value = '';
  } catch (error) {
    console.error(error);
    showToast('Error adding URL.', 'error');
  }
});

// Edit Modal
function openEditModal(hostname, affiliateUrl, status) {
  editHostname = hostname;
  document.getElementById('edit-hostname').value = hostname;
  document.getElementById('edit-url').value = affiliateUrl;
  document.getElementById('edit-tag').value = '';
  document.getElementById('edit-status').value = status;
  document.getElementById('editModal').style.display = 'flex';
}

document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('editModal').style.display = 'none';
});

document.getElementById('edit-submit-btn').addEventListener('click', async () => {
  const newUrl = document.getElementById('edit-url').value.trim();
  const newTag = document.getElementById('edit-tag')?.value.trim() || '';
  const newStatus = document.getElementById('edit-status').value;

  if (!newUrl) {
    showToast('Please enter Affiliate URL.', 'error');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/edit-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostname: editHostname, newUrl, newTag, newStatus }),
    });

    const data = await response.json();
    showToast(data.message, 'success');
    fetchTrackingUrls();
    document.getElementById('editModal').style.display = 'none';
  } catch (error) {
    console.error(error);
    showToast('Error editing URL.', 'error');
  }
});

// Delete
async function deleteUrl(hostname) {
  if (confirm(`Are you sure you want to delete the URL for ${hostname}?`)) {
    try {
      const response = await fetch(`${apiUrl}/delete-url/${hostname}`, { method: 'DELETE' });
      const data = await response.json();
      showToast(data.message, 'success');
      fetchTrackingUrls();
    } catch (error) {
      console.error(error);
      showToast('Error deleting URL.', 'error');
    }
  }
}

// Toggle Status
async function toggleStatus(hostname, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  try {
    const response = await fetch(`${apiUrl}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostname, newStatus }),
    });

    const data = await response.json();
    showToast(data.message, 'success');
    fetchTrackingUrls();
  } catch (error) {
    console.error(error);
    showToast('Error toggling status.', 'error');
  }
}

window.onload = fetchTrackingUrls;
