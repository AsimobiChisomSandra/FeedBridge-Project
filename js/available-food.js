const foodFeed = document.getElementById('foodFeed');
const searchFilter = document.getElementById('searchFilter');
const safetyFilter = document.getElementById('safetyFilter');

// Load food listings
function loadFoodListings() {
  const foodListings = JSON.parse(localStorage.getItem('foodListings')) || [];
  
  if (foodListings.length === 0) {
    foodFeed.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <p>📭 No food listings yet. Be the first to share surplus food!</p>
        <a href="./listing.html" class="btn btn--green" style="display: inline-block;">List Food Now</a>
      </div>
    `;
    return;
  }
  
  displayListings(foodListings);
}

// Display food listings
function displayListings(listings) {
  foodFeed.innerHTML = '';
  
  listings.forEach((listing, index) => {
    const safetyStatus = determineSafetyStatus(listing);
    const allergenText = listing.allergens.length > 0 ? listing.allergens.join(', ') : 'None';
    
    const card = document.createElement('div');
    card.className = 'food-card';
    card.innerHTML = `
      <div class="food-card-image" style="background: linear-gradient(135deg, rgb(26, 228, 26), orangered); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
        📦 ${listing.foodType.substring(0, 15)}
      </div>
      <div class="food-card-content">
        <div class="food-card-header">
          <h3 class="food-card-title">${listing.foodType}</h3>
          <span class="safety-badge ${safetyStatus.class}">${safetyStatus.text}</span>
        </div>
        <div class="food-card-details">
          <div class="detail-row">
            <strong>📍 Location:</strong> ${listing.location}
          </div>
          <div class="detail-row">
            <strong>📦 Quantity:</strong> ${listing.quantity}
          </div>
          <div class="detail-row">
            <strong>🕐 Pickup by:</strong> ${formatTime(listing.pickupDeadline)}
          </div>
          <div class="detail-row">
            <strong>🧊 Refrigerated:</strong> ${listing.refrigerated === 'yes' ? '✓ Yes' : '✗ No'}
          </div>
        </div>
        <div class="allergens">
          <strong>⚠️ Allergens:</strong> ${allergenText}
        </div>
        <div class="donor-info">
          <strong>${listing.donorName}</strong> • ${listing.donorPhone}
        </div>
        <div class="food-card-actions">
          <button class="btn-claim" onclick="claimFood(${index})">Claim This Food</button>
          <button class="btn-report" onclick="reportListing(${index})">🚩 Report</button>
        </div>
      </div>
    `;
    foodFeed.appendChild(card);
  });
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

// Claim food
function claimFood(index) {
  const listings = JSON.parse(localStorage.getItem('foodListings')) || [];
  const food = listings[index];
  alert(`✓ You've claimed ${food.quantity} of ${food.foodType}!\n\nPickup location: ${food.location}\nContact: ${food.donorName} - ${food.donorPhone}`);
}

// Report listing
function reportListing(index) {
  const listings = JSON.parse(localStorage.getItem('foodListings')) || [];
  listings.splice(index, 1);
  localStorage.setItem('foodListings', JSON.stringify(listings));
  alert('🚩 Listing reported and hidden. Thank you for helping keep FeedBridge safe.');
  loadFoodListings();
}

// Filter listings
function filterListings() {
  const listings = JSON.parse(localStorage.getItem('foodListings')) || [];
  const searchTerm = searchFilter.value.toLowerCase();
  const safetyValue = safetyFilter.value;
  
  const filtered = listings.filter(listing => {
    const matchesSearch = listing.foodType.toLowerCase().includes(searchTerm) || 
                         listing.location.toLowerCase().includes(searchTerm);
    
    const safetyStatus = determineSafetyStatus(listing);
    const matchesSafety = !safetyValue || safetyStatus.class === safetyValue;
    
    return matchesSearch && matchesSafety;
  });
  
  displayListings(filtered);
}

// Event listeners
searchFilter.addEventListener('input', filterListings);
safetyFilter.addEventListener('change', filterListings);

// Load on page load
loadFoodListings();