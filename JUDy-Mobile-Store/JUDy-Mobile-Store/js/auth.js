/* ============================================================
   auth.js - register, login, profile (accounts in LocalStorage)
   Simple setup: username and password only.
   Note: passwords are stored as plain text because this is a
   school demo. A real website must never do this.
   ============================================================ */

function showMessage(id, message) {
  const box = document.getElementById(id);
  if (!box) return;
  box.textContent = message;
  box.style.display = message ? 'block' : 'none';
}

// ---------- Register ----------
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('regUsername').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    const users = getUsers();

    if (!/^[a-z0-9_]{3,20}$/.test(username)) return showMessage('formError', 'Username must be 3-20 letters, numbers or underscore.');
    if (password.length < 4) return showMessage('formError', 'Password must be at least 4 characters.');
    if (password !== confirm) return showMessage('formError', 'Passwords do not match.');
    if (users.some((u) => u.username === username) || username === loadData(KEYS.admin, {}).username) {
      return showMessage('formError', 'This username is already taken.');
    }

    users.push({ id: Date.now(), username, name: '', email: '', password, phone: '', address: '', createdAt: new Date().toISOString(), active: true });
    saveUsers(users);
    window.location.href = 'login.html?registered=1';
  });
}

// ---------- Login ----------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  if (getParam('registered')) { const ok = document.getElementById('formSuccess'); ok.textContent = 'Account created! Please login.'; ok.style.display = 'block'; }
  if (getParam('redirect')) showMessage('formError', 'Please login to continue.');

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const admin = loadData(KEYS.admin, {});

    if (!username || !password) return showMessage('formError', 'Enter your username and password.');

    // Admin login
    if (username === admin.username && password === admin.password) {
      saveData(KEYS.session, { role: 'admin' });
      window.location.href = 'admin.html';
      return;
    }
    // Customer login
    const user = getUsers().find((u) => u.username === username && u.password === password);
    if (!user) return showMessage('formError', 'Incorrect username or password.');
    if (user.active === false) return showMessage('formError', 'Your account has been deactivated. Please contact support.');

    saveData(KEYS.session, { role: 'user', username: user.username });
    const redirect = getParam('redirect');
    window.location.href = redirect && /^[a-z-]+\.html$/.test(redirect) ? redirect : 'index.html';
  });
}

// ---------- Profile ----------
const profileForm = document.getElementById('profileForm');
if (profileForm) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html?redirect=profile.html';
  } else {
    const fields = ['profName', 'profEmail', 'profPhone', 'profAddress'];
    const setEditing = (editing) => {
      fields.forEach((id) => (document.getElementById(id).disabled = !editing));
      document.getElementById('editBtn').hidden = editing;
      document.getElementById('saveBtn').hidden = !editing;
    };
    document.getElementById('profUsername').value = user.username;
    document.getElementById('profName').value = user.name || '';
    document.getElementById('profEmail').value = user.email || '';
    document.getElementById('profPhone').value = user.phone || '';
    document.getElementById('profAddress').value = user.address || '';
    setEditing(false);

    document.getElementById('editBtn').addEventListener('click', () => setEditing(true));
    profileForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('profEmail').value.trim();
      const phone = document.getElementById('profPhone').value.trim();
      if (email && !isValidEmail(email)) return showMessage('formError', 'Email is not valid.');
      if (phone && !/^(09|\+639)\d{9}$/.test(phone)) return showMessage('formError', 'Contact number must look like 09123456789.');

      const users = getUsers();
      const saved = users.find((u) => u.username === user.username);
      saved.name = document.getElementById('profName').value.trim();
      saved.email = email;
      saved.phone = phone;
      saved.address = document.getElementById('profAddress').value.trim();
      saveUsers(users);
      Object.assign(user, saved);
      showMessage('formError', '');
      setEditing(false);
      toast('Profile updated');
    });
  }
}
