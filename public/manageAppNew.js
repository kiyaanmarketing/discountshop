const apiUrl = '/api';
let editHostname = '';

async function fetchTrackingUrls() {
  try {
    const response = await fetch(`${apiUrl}/tracking-urls`);
    if (!response.ok) throw new Error(`Fetch failed with status=> ${response.status}`);

    const data = await response.json();
    const tableBody = document.querySelector('#urls-table tbody');
    tableBody.innerHTML = '';

    data.forEach(({ hostname, affiliateUrl, status }) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${hostname}</td>
        <td>${affiliateUrl}</td>
        <td>
          <button class="toggle" onclick="toggleStatus('${hostname}', '${status}')">
            ${status === 'active' ? '✅ Active' : '❌ Inactive'}
          </button>
        </td>
        <td class="actions">
          <button onclick="openEditModal('${hostname}', '${affiliateUrl}', '${status}')">Edit</button>
          <button class="delete" onclick="deleteUrl('${hostname}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    alert('Error fetching tracking URLs vhl.');
  }
}

// Add URL
document.getElementById('submit-btn').addEventListener('click', async () => {
  const hostname = document.getElementById('hostname').value.trim();
  const affiliateUrl = document.getElementById('affiliateUrl').value.trim();
  const status = document.getElementById('status').value;

  if (!hostname || !affiliateUrl) {
    alert('Please fill all fields.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/add-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostname, affiliateUrl, status }),
    });

    const data = await response.json();
    alert(data.message);
    fetchTrackingUrls();
    document.getElementById('hostname').value = '';
    document.getElementById('affiliateUrl').value = '';
  } catch (error) {
    console.error(error);
    alert('Error adding URL.');
  }
});

// Edit Modal
function openEditModal(hostname, affiliateUrl, status) {
  editHostname = hostname;
  document.getElementById('edit-hostname').value = hostname;
  document.getElementById('edit-url').value = affiliateUrl;
  document.getElementById('edit-status').value = status;
  document.getElementById('editModal').style.display = 'flex';
}

document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('editModal').style.display = 'none';
});

document.getElementById('edit-submit-btn').addEventListener('click', async () => {
  const newUrl = document.getElementById('edit-url').value.trim();
  const newStatus = document.getElementById('edit-status').value;

  if (!newUrl) {
    alert('Please enter Affiliate URL.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/edit-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostname: editHostname, newUrl, newStatus }),
    });

    const data = await response.json();
    alert(data.message);
    fetchTrackingUrls();
    document.getElementById('editModal').style.display = 'none';
  } catch (error) {
    console.error(error);
    alert('Error editing URL.');
  }
});

// Delete
async function deleteUrl(hostname) {
  if (confirm(`Are you sure you want to delete the URL for ${hostname}?`)) {
    try {
      const response = await fetch(`${apiUrl}/delete-url/${hostname}`, { method: 'DELETE' });
      const data = await response.json();
      alert(data.message);
      fetchTrackingUrls();
    } catch (error) {
      console.error(error);
      alert('Error deleting URL.');
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
    alert(data.message);
    fetchTrackingUrls();
  } catch (error) {
    console.error(error);
    alert('Error toggling status.');
  }
}

window.onload = fetchTrackingUrls;
