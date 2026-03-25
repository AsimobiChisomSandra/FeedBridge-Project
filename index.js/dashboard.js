// Load dynamic data from localStorage
document.addEventListener('DOMContentLoaded', function() {
  const foodListings = JSON.parse(localStorage.getItem('foodListings')) || [];
  
  // Calculate metrics
  const mealsSaved = foodListings.length * 12; // Estimate 12 servings per listing
  const activeDonors = new Set(foodListings.map(f => f.donorName)).size;
  
  // Update dashboard
  document.getElementById('mealsSaved').textContent = mealsSaved.toLocaleString();
  document.getElementById('activeDonors').textContent = activeDonors || 156;
  document.getElementById('verifiedNGOs').textContent = 24;
  document.getElementById('wastePrevented').textContent = (foodListings.length * 0.35).toFixed(1) + ' tons';
  
  // Populate recent activity
  const activityList = document.getElementById('activityList');
  if (foodListings.length > 0) {
    const recent = foodListings.slice(-5).reverse();
    activityList.innerHTML = recent.map(listing => `
      <div class="activity-item">
        <p><strong>${listing.donorName}</strong> listed ${listing.quantity} of ${listing.foodType}</p>
        <small>${new Date(listing.timestamp).toLocaleDateString()}</small>
      </div>
    `).join('');
  }
});