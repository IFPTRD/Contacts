const PASSWORD_HASH = '46972c3a1007be39a96fee8c0d4413be07299eee64077a50294d0e80ca5d26b6';
let contacts = [];
let editingId = null;

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleLogin() {
  const pwd = document.getElementById('password').value;
  const hash = await sha256(pwd);
  if (hash === PASSWORD_HASH) {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    loadContacts();
  } else {
    document.getElementById('loginError').textContent = 'Incorrect password';
  }
}

document.getElementById('loginBtn').addEventListener('click', handleLogin);

document.getElementById('addBtn').addEventListener('click', () => openModal());

document.getElementById('cancelBtn').addEventListener('click', closeModal);

document.getElementById('search').addEventListener('input', renderContacts);

document.getElementById('contactForm').addEventListener('submit', saveContact);

function loadContacts() {
  const stored = localStorage.getItem('contacts');
  if (stored) {
    contacts = JSON.parse(stored);
    renderContacts();
  } else {
    fetch('contacts.json')
      .then(r => r.json())
      .then(data => { contacts = data; saveLocal(); renderContacts(); });
  }
}

function saveLocal() {
  localStorage.setItem('contacts', JSON.stringify(contacts));
}

function renderContacts() {
  const tbody = document.querySelector('#contactsTable tbody');
  tbody.innerHTML = '';
  const term = document.getElementById('search').value.toLowerCase();
  contacts
    .filter(c => {
      const tagStr = (c.tags || []).join(' ').toLowerCase();
      return (
        c.branch.toLowerCase().includes(term) ||
        c.department.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        tagStr.includes(term)
      );
    })
    .forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.branch}</td>
        <td>${c.department}</td>
        <td>${c.name}</td>
        <td>${c.title}</td>
        <td>${c.division || ''}</td>
        <td><a href="mailto:${c.email}">${c.email}</a></td>
        <td>${(c.tags || []).join(', ')}</td>
        <td>${c.preferences || ''}</td>
        <td>
          <button onclick="createEmail(${c.id})">Email</button>
          <button onclick="openModal(${c.id})">Edit</button>
        </td>`;
      tbody.appendChild(tr);
    });
}

function openModal(id) {
  editingId = id || null;
  const modal = document.getElementById('modal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('contactForm');
  form.reset();
  if (editingId) {
    title.textContent = 'Edit Contact';
    const c = contacts.find(x => x.id === editingId);
    document.getElementById('branch').value = c.branch;
    document.getElementById('department').value = c.department;
    document.getElementById('contactName').value = c.name;
    document.getElementById('title').value = c.title;
    document.getElementById('division').value = c.division || '';
    document.getElementById('email').value = c.email;
    document.getElementById('tags').value = (c.tags || []).join(', ');
    document.getElementById('preferences').value = c.preferences || '';
    document.getElementById('prefTo').value = (c.preferred_to || []).join(', ');
    document.getElementById('prefCc').value = (c.preferred_cc || []).join(', ');
  } else {
    title.textContent = 'Add Contact';
  }
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function saveContact(e) {
  e.preventDefault();
  const user = document.getElementById('userName').value.trim();
  if (!user) return;
  const obj = {
    branch: document.getElementById('branch').value.trim(),
    department: document.getElementById('department').value.trim(),
    name: document.getElementById('contactName').value.trim(),
    title: document.getElementById('title').value.trim(),
    division: document.getElementById('division').value.trim(),
    email: document.getElementById('email').value.trim(),
    tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(Boolean),
    preferences: document.getElementById('preferences').value.trim(),
    preferred_to: document.getElementById('prefTo').value.split(',').map(t => t.trim()).filter(Boolean),
    preferred_cc: document.getElementById('prefCc').value.split(',').map(t => t.trim()).filter(Boolean),
    last_modified_by: user,
    last_modified_at: new Date().toISOString().split('T')[0]
  };
  if (editingId) {
    obj.id = editingId;
    const index = contacts.findIndex(c => c.id === editingId);
    contacts[index] = obj;
  } else {
    obj.id = contacts.length ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
    contacts.push(obj);
  }
  saveLocal();
  renderContacts();
  closeModal();
}

function createEmail(id) {
  const c = contacts.find(x => x.id === id);
  const to = encodeURIComponent((c.preferred_to && c.preferred_to.length ? c.preferred_to : [c.email]).join(';'));
  const cc = encodeURIComponent((c.preferred_cc || []).join(';'));
  const url = `mailto:${to}?cc=${cc}`;
  window.location.href = url;
}

window.createEmail = createEmail;
window.openModal = openModal;
