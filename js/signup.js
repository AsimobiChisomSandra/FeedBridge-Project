// User Type Selection
document.querySelectorAll('.user-type-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove active class from all buttons
    document.querySelectorAll('.user-type-btn').forEach(b => b.classList.remove('active'));
    
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Set hidden input value
    document.getElementById('userType').value = btn.dataset.type;
  });
});

// Password Strength Checker
document.getElementById('password').addEventListener('input', (e) => {
  const password = e.target.value;
  const strengthIndicator = document.getElementById('passwordStrength');
  
  if (password.length === 0) {
    strengthIndicator.classList.remove('weak', 'medium', 'strong');
    return;
  }

  let strength = 0;
  
  // Check length
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Check for uppercase
  if (/[A-Z]/.test(password)) strength++;
  
  // Check for lowercase
  if (/[a-z]/.test(password)) strength++;
  
  // Check for numbers
  if (/[0-9]/.test(password)) strength++;
  
  // Check for special characters
  if (/[!@#$%^&*]/.test(password)) strength++;

  strengthIndicator.classList.remove('weak', 'medium', 'strong');
  
  if (strength <= 2) {
    strengthIndicator.textContent = '⚠️ Weak password';
    strengthIndicator.classList.add('weak');
  } else if (strength <= 4) {
    strengthIndicator.textContent = '✓ Medium password';
    strengthIndicator.classList.add('medium');
  } else {
    strengthIndicator.textContent = '✓✓ Strong password';
    strengthIndicator.classList.add('strong');
  }
});

// Form Validation Functions
function validateFullName(fullname) {
  if (fullname.trim().length < 3) {
    return 'Full name must be at least 3 characters';
  }
  if (!/^[a-zA-Z\s'-]+$/.test(fullname)) {
    return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
  }
  return '';
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  // Check if email already exists in localStorage
  const users = JSON.parse(localStorage.getItem('feedbridgeUsers')) || [];
  if (users.some(user => user.email === email)) {
    return 'This email is already registered';
  }
  
  return '';
}

function validatePhone(phone) {
  if (phone.trim() === '') return ''; // Phone is optional
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Please enter a valid phone number';
  }
  return '';
}

function validateLocation(location) {
  if (location.trim().length < 2) {
    return 'Location must be at least 2 characters';
  }
  return '';
}

function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return '';
}

function validateConfirmPassword(password, confirmPassword) {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
}

function validateTerms(termsChecked) {
  if (!termsChecked) {
    return 'You must agree to the Terms & Conditions';
  }
  return '';
}

// Show error message
function showError(fieldId, message) {
  const errorElement = document.getElementById(fieldId + 'Error');
  const inputElement = document.getElementById(fieldId);
  
  if (message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.classList.add('error');
  } else {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
    inputElement.classList.remove('error');
  }
}

// Form Submission
document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();

  // Get form values
  const fullname = document.getElementById('fullname').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const location = document.getElementById('location').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const userType = document.getElementById('userType').value;
  const termsChecked = document.getElementById('terms').checked;

  // Validate all fields
  const fullnameError = validateFullName(fullname);
  const emailError = validateEmail(email);
  const phoneError = validatePhone(phone);
  const locationError = validateLocation(location);
  const passwordError = validatePassword(password);
  const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
  const termsError = validateTerms(termsChecked);

  // Display errors
  showError('fullname', fullnameError);
  showError('email', emailError);
  showError('phone', phoneError);
  showError('location', locationError);
  showError('password', passwordError);
  showError('confirmPassword', confirmPasswordError);
  
  if (termsError) {
    document.getElementById('termsError').textContent = termsError;
    document.getElementById('termsError').classList.add('show');
  } else {
    document.getElementById('termsError').textContent = '';
    document.getElementById('termsError').classList.remove('show');
  }

  // If any error exists, stop form submission
  if (fullnameError || emailError || phoneError || locationError || passwordError || confirmPasswordError || termsError) {
    return;
  }

  // If validation passes, create user account
  const newUser = {
    id: Date.now(),
    fullname: fullname,
    email: email,
    phone: phone,
    location: location,
    password: btoa(password), // Basic encoding (NOT secure for production)
    userType: userType,
    createdAt: new Date().toISOString(),
    isDonor: userType === 'donor',
    claimedFood: [],
    donations: []
  };

  // Get existing users from localStorage
  let users = JSON.parse(localStorage.getItem('feedbridgeUsers')) || [];
  
  // Add new user
  users.push(newUser);
  
  // Save to localStorage
  localStorage.setItem('feedbridgeUsers', JSON.stringify(users));

  // Show success message
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('successMessage').style.display = 'block';

  // Redirect to login after 3 seconds
  setTimeout(() => {
    window.location.href = './login.html';
  }, 3000);
});