


const apiUrl = '/api';

let editHostname = '';

// simple toast notifications
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

    if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);

    const data = await response.json();

    const tableBody = document.querySelector('#urls-table tbody');
    tableBody.innerHTML = '';

    data.forEach(({ hostname, affiliateUrl, status, tagUrl }) => {
      const h = hostname.S || hostname;
      const url = affiliateUrl.S || affiliateUrl;
      const tag = tagUrl ? (tagUrl.S || tagUrl) : '';
      const state = status || 'active';
      const toggleClass = state === 'active' ? 'active' : 'inactive';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${h}</td>
        <td>${url}</td>
        <td>${tag}</td>
        <td class="actions">
          <button class="toggle ${toggleClass}" onclick="toggleStatus('${h}', '${state}')">
            <i class="fas ${state==='active' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            ${state.charAt(0).toUpperCase() + state.slice(1)}
          </button>
          <button class="edit" onclick="openEditModal('${h}', '${url}', '${tag}', '${state}')"><i class="fas fa-edit"></i>Edit</button>
          <button class="delete" onclick="deleteUrl('${h}')"><i class="fas fa-trash"></i>Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    alert('Error fetching tracking URLs.');
  }
}




document.getElementById('submit-btn').addEventListener('click', async () => {
  const hostname = document.getElementById('hostname').value.trim();
  const affiliateUrl = document.getElementById('affiliateUrl').value.trim();
  const tagUrl = document.getElementById('tagUrl')?.value.trim() || '';
  const status = document.getElementById('status').value;

  if (!hostname || !affiliateUrl) {
    alert('Please fill both hostname and URL.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/add-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hostname, affiliateUrl, tagUrl, status }),
    });

    const data = await response.json();
    showToast(data.message, 'success');
    fetchTrackingUrls();
    document.getElementById('hostname').value = '';
    document.getElementById('affiliateUrl').value = '';
    document.getElementById('status').value = 'active';
  } catch (error) {
    console.error(error);
    showToast('Error adding URL.', 'error');
  }
});

function openEditModal(hostname, affiliateUrl, tagUrl, status) {
  editHostname = hostname;
  document.getElementById('edit-hostname').value = hostname;
  document.getElementById('edit-url').value = affiliateUrl;
  document.getElementById('edit-tag').value = tagUrl || '';
  document.getElementById('edit-status').value = status || 'active';
  document.getElementById('editModal').style.display = 'flex';
}

document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('editModal').style.display = 'none';
});

document.getElementById('edit-submit-btn').addEventListener('click', async () => {
  const newHostname = document.getElementById('edit-hostname').value.trim();
  const newUrl = document.getElementById('edit-url').value.trim();
    const newTag = document.getElementById('edit-tag')?.value.trim() || ''; // Ensure newTag is populated correctly
  const newStatus = document.getElementById('edit-status').value;

  if (!newHostname || !newUrl) {
    alert('Please enter both hostname and URL.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/edit-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

async function deleteUrl(hostname) {
  if (confirm(`Are you sure you want to delete the URL for ${hostname}?`)) {
    try {
      const response = await fetch(`${apiUrl}/delete-url/${hostname}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      showToast(data.message, 'success');
      fetchTrackingUrls();
    } catch (error) {
      console.error(error);
      showToast('Error deleting URL.', 'error');
    }
  }
}

// Toggle status via API and refresh table
async function toggleStatus(hostname, current) {
  const newStatus = current === 'active' ? 'inactive' : 'active';
  try {
    const response = await fetch(`${apiUrl}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostname, newStatus }),
    });
    const data = await response.json();
    fetchTrackingUrls();
  } catch (error) {
    console.error('Toggle error:', error);
    showToast('Error toggling status.', 'error');
  }
}

window.onload = fetchTrackingUrls;
