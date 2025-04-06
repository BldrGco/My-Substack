let subscriptions = [];

// Load initial data from data.json or localStorage
function loadData() {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      subscriptions = localStorage.getItem('subscriptions') ? JSON.parse(localStorage.getItem('subscriptions')) : data;
      renderSubscriptions();
    })
    .catch(() => {
      subscriptions = localStorage.getItem('subscriptions') ? JSON.parse(localStorage.getItem('subscriptions')) : [];
      renderSubscriptions();
    });
}

function renderSubscriptions(filter = 'all', search = '') {
  const subsDiv = document.getElementById('subscriptions');
  subsDiv.innerHTML = subscriptions
    .filter(sub => (filter === 'all' || sub.status === filter))
    .filter(sub => 
      sub.name.toLowerCase().includes(search.toLowerCase()) || 
      sub.notes.toLowerCase().includes(search.toLowerCase()) || 
      sub.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    )
    .map(sub => `
      <div class="sub-card ${sub.status}">
        <h3><a href="${sub.url}" target="_blank">${sub.name}</a></h3>
        <p class="tags">Tags: ${sub.tags.join(', ')} <button onclick="editTags('${sub.name}')">Edit</button></p>
        <p>Status: ${sub.status} <button onclick="cycleStatus('${sub.name}')">Cycle</button></p>
        <p>Notes:</p>
        <textarea onchange="updateNotes('${sub.name}', this.value)">${sub.notes}</textarea>
      </div>
    `).join('');
  saveToLocalStorage();
}

function saveToLocalStorage() {
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
}

function cycleStatus(name) {
  const sub = subscriptions.find(s => s.name === name);
  if (sub.status === 'active') sub.status = 'paused';
  else if (sub.status === 'paused') sub.status = 'dropped';
  else sub.status = 'active';
  renderSubscriptions(document.getElementById('filter').value, document.getElementById('search').value);
}

function updateNotes(name, value) {
  const sub = subscriptions.find(s => s.name === name);
  sub.notes = value;
  saveToLocalStorage();
}

function editTags(name) {
  const sub = subscriptions.find(s => s.name === name);
  const newTags = prompt('Edit tags (comma-separated):', sub.tags.join(', '));
  if (newTags) {
    sub.tags = newTags.split(',').map(tag => tag.trim());
    renderSubscriptions(document.getElementById('filter').value, document.getElementById('search').value);
  }
}

document.getElementById('filter').addEventListener('change', (e) => 
  renderSubscriptions(e.target.value, document.getElementById('search').value));
document.getElementById('search').addEventListener('input', (e) => 
  renderSubscriptions(document.getElementById('filter').value, e.target.value));

document.getElementById('add-sub').addEventListener('click', () => {
  const name = prompt('Substack name:');
  const url = prompt('URL:');
  if (name && url) {
    subscriptions.push({ name, url, tags: [], status: 'active', notes: '' });
    renderSubscriptions();
  }
});

document.getElementById('export').addEventListener('click', () => {
  const dataStr = JSON.stringify(subscriptions, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'subscriptions.json';
  a.click();
  URL.revokeObjectURL(url);
});

loadData();
