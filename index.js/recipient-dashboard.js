const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const recipientSearch = document.getElementById('recipientSearch');
const recipientSafetyFilter = document.getElementById('recipientSafetyFilter');
const recipientFoodFeed = document.getElementById('recipientFoodFeed');

// Tab switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    // Remove active class from all
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Add active to clicked
    this.classList.add('active');
    const tabId = this.getAttribute('data-tab') + '-tab';
    document.getElementById(tabId).classList.add('active');
    
    // Load tab content
    if (tabId === 'available-tab') {
      loadAvailableFood();
    } else if (tabId === 'claimed-tab') {
      loadClaimedFood();
    } else if (tabId === 'history-tab') {
      loadHistory();
    }
  });
});

// Load available food
function loadAvailableFood() {
  const foodListings = JSON.parse(localStorage.getItem('foodListings')) || [];
  
  if (foodListings.length === 0) {
    recipientFoodFeed.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <p>📭 No food available right now. Check back soon!</p>
      </div>
    `;
    return;
  }
  
  displayFoodCards(foodListings);
}

// Display food cards
function displayFoodCards(listings) {
  recipientFoodFeed.innerHTML = '';
  
  listings.forEach((listing, index) => {
    const safetyStatus = determineSafetyStatus(listing);
    const allergenText = listing.allergens.length > 0 ? listing.allergens.join(', ') : 'None';
    
    const card = document.createElement('div');
    card.className = 'food-card';
    card.innerHTML = `
      <div class="food-card-image">
        📦 ${listing.foodType.substring(0, 15)}
      </div>
      <div class="food-card-content">
        <div class="food-card-header">
          <h3 class="food-card-title">${listing.foodType}</h3>
          <span class="safety-badge ${safetyStatus.class}">${safetyStatus.text}</span>
        </div>
        <div class="food-card-details">
          <div class="detail-row"><strong>📍</strong> ${listing.location}</div>
          <div class="detail-row"><strong>📦</strong> ${listing.quantity}</div>
          <div class="detail-row"><strong>🕐</strong> Pickup by ${formatTime(listing.pickupDeadline)}</div>
          <div class="detail-row"><strong>🧊</strong> ${listing.refrigerated === 'yes' ? '✓ Refrigerated' : '✗ Not Refrigerated'}</div>
        </div>
        <div class="allergens">
          <strong>⚠️ Allergens:</strong> ${allergenText}
        </div>
        <div class="donor-info">
          <strong>${listing.donorName}</strong> · ${listing.donorPhone}
        </div>
        <div class="food-card-actions">
          <button class="btn-claim" onclick="claimFood(${index})">Claim This Food</button>
          <button class="btn-report" onclick="reportFood(${index})">🚩 Report</button>
        </div>
      </div>
    `;
    recipientFoodFeed.appendChild(card);
  });
}

// Claim food
function claimFood(index) {
  const foodListings = JSON.parse(localStorage.getItem('foodListings')) || [];
  const food = foodListings[index];
  
  // Store claim
  let userClaims = JSON.parse(localStorage.getItem('userClaims')) || [];
  userClaims.push({
    ...food,
    claimedAt: new Date().toISOString(),
    status: 'pending'
  });
  localStorage.setItem('userClaims', JSON.stringify(userClaims));
  
  alert(`✓ Food claimed!\n\n${food.foodType}\nPickup: ${food.location}\nContact: ${food.donorName} - ${food.donorPhone}`);
  updateStats();
  loadAvailableFood();
}

// Report food
function reportFood(index) {
  const foodListings = JSON.parse(localStorage.getItem('foodListings')) || [];
  foodListings.splice(index, 1);
  localStorage.setItem('foodListings', JSON.stringify(foodListings));
  alert('🚩 Listing reported and hidden');
  loadAvailableFood();
}

// Load claimed food
function loadClaimedFood() {
  const userClaims = JSON.parse(localStorage.getItem('userClaims')) || [];
  const claimedList = document.getElementById('claimedList');
  
  if (userClaims.length === 0) {
    claimedList.innerHTML = '<div class="empty-state"><p>No claimed food yet</p></div>';
    return;
  }
  
  claimedList.innerHTML = userClaims.map((claim, idx) => `
    <div class="claimed-item">
      <h3>${claim.foodType}</h3>
      <p><strong>Quantity:</strong> ${claim.quantity}</p>
      <p><strong>Location:</strong> ${claim.location}</p>
      <p><strong>Contact:</strong> ${claim.donorName} (${claim.donorPhone})</p>
      <p><strong>Pickup by:</strong> ${formatTime(claim.pickupDeadline)}</p>
      <span class="status pending">⏳ Pending Pickup</span>
      <button onclick="markAsCompleted(${idx})" style="margin-top: 1rem; padding: 0.5rem 1rem; background: rgb(26, 228, 26); color: white; border: none; border-radius: 6px; cursor: pointer;">✓ Mark Complete</button>
    </div>
  `).join('');
}

// Mark as completed
function markAsCompleted(index) {
  let userClaims = JSON.parse(localStorage.getItem('userClaims')) || [];
  if (userClaims[index]) {
    userClaims[index].status = 'completed';
    userClaims[index].completedAt = new Date().toISOString();
    localStorage.setItem('userClaims', JSON.stringify(userClaims));
    alert('✓ Marked as completed!');
    updateStats();
    loadClaimedFood();
  }
}

// Load history
function loadHistory() {
  const userClaims = JSON.parse(localStorage.getItem('userClaims')) || [];
  const historyList = document.getElementById('historyList');
  
  const history = userClaims.filter(c => c.status === 'completed');
  
  if (history.length === 0) {
    historyList.innerHTML = '<div class="empty-state"><p>No completed claims yet</p></div>';
    return;
  }
  
  historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <h3>${item.foodType}</h3>
      <p><strong>Quantity:</strong> ${item.quantity}</p>
      <p><strong>From:</strong> ${item.donorName}</p>
      <p><strong>Completed:</strong> ${new Date(item.completedAt).toLocaleDateString()}</p>
      <span class="status completed">✓ Completed</span>
    </div>
  `).join('');
}

// Determine safety status
function determineSafetyStatus(listing) {
  const preparedTime = new Date(listing.preparedTime);
  const now = new Date();
  const ageInHours = (now - preparedTime) / (1000 * 60 * 60);
  
  if (listing.refrigerated === 'no' && ageInHours > 2) {
    return { text: '⚠️ Consume with Caution', class: 'caution' };
  }
  
  if (ageInHours > 6) {
    return { text: '⚠️ Consume with Caution', class: 'caution' };
  }
  
  return { text: '✓ Safe to Eat', class: 'safe' };
}

// Format time
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Update stats
function updateStats() {
  const userClaims = JSON.parse(localStorage.getItem('userClaims')) || [];
  const completed = userClaims.filter(c => c.status === 'completed').length;
  const upcoming = userClaims.filter(c => c.status !== 'completed').length;
  
  document.getElementById('myClaimsCount').textContent = userClaims.length;
  document.getElementById('mealsReceivedCount').textContent = completed;
  document.getElementById('upcomingPickups').textContent = upcoming;
}

// Filter
recipientSearch.addEventListener('input', filterFoods);
recipientSafetyFilter.addEventListener('change', filterFoods);

function filterFoods() {
  const foodListings = JSON.parse(localStorage.getItem('foodListings')) || [];
  const searchTerm = recipientSearch.value.toLowerCase();
  const safetyValue = recipientSafetyFilter.value;
  
  const filtered = foodListings.filter(listing => {
    const matchesSearch = listing.foodType.toLowerCase().includes(searchTerm) || 
                         listing.location.toLowerCase().includes(searchTerm);
    
    const safetyStatus = determineSafetyStatus(listing);
    const matchesSafety = !safetyValue || safetyStatus.class === safetyValue;
    
    return matchesSearch && matchesSafety;
  });
  
  displayFoodCards(filtered);
}

// Load on page load
updateStats();
loadAvailableFood();