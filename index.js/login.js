const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const remember = document.getElementById('remember').checked;
  
  // Store login info in localStorage
  const userData = {
    email: email,
    loginTime: new Date().toISOString(),
    remembered: remember
  };
  
  localStorage.setItem('userLogin', JSON.stringify(userData));
  
  // Show success and redirect
  alert('✓ Login successful! Welcome to FeedBridge');
  window.location.href = './recipient-dashboard.html';
});