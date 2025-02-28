


const apiUrl = '/api';

let editHostname = '';

async function fetchTrackingUrls() {
  try {
    
    const response = await fetch(`${apiUrl}/tracking-urls`);
    

    if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);

    const data = await response.json();
   

    const tableBody = document.querySelector('#urls-table tbody');
    tableBody.innerHTML = '';

    data.forEach(({ hostname, affiliateUrl }) => {
      
      //console.log("affiliateUrl 121 => ", affiliateUrl.S)
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${hostname.S}</td>
        <td>${affiliateUrl.S}</td>
        <td class="actions">
        
          <button class="delete" onclick="deleteUrl('${hostname.S}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    alert('Error fetching tracking URLs. => 129');
  }
}




document.getElementById('submit-btn').addEventListener('click', async () => {
  const hostname = document.getElementById('hostname').value.trim();
  const affiliateUrl = document.getElementById('affiliateUrl').value.trim();

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
      body: JSON.stringify({ hostname, affiliateUrl }),
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

function openEditModal(hostname, affiliateUrl) {
  
  editHostname = hostname;
  document.getElementById('edit-hostname').value = hostname;
  document.getElementById('edit-url').value = affiliateUrl;
  document.getElementById('editModal').style.display = 'flex';
}

document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('editModal').style.display = 'none';
});

document.getElementById('edit-submit-btn').addEventListener('click', async () => {
  const newHostname = document.getElementById('edit-hostname').value.trim();
  const newUrl = document.getElementById('edit-url').value.trim();

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
      body: JSON.stringify({ editHostname, newHostname, newUrl }),
    });

    const data = await response.json();
    alert(data.message);
    fetchTrackingUrls();
    document.getElementById('editModal').style.display = 'none';
  } catch (error) {
    console.error(error);
    alert('Error editing URL. 207');
  }
});

async function deleteUrl(hostname) {
  if (confirm(`Are you sure you want to delete the URL for ${hostname}?`)) {
    try {
      const response = await fetch(`${apiUrl}/delete-url/${hostname}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      alert(data.message);
      fetchTrackingUrls();
    } catch (error) {
      console.error(error);
      alert('Error deleting URL.');
    }
  }
}

window.onload = fetchTrackingUrls;
