/**
 * FeedBridge Food Listing Form
 * Handles form validation, submission, and food listing creation
 */

class FoodListingForm {
  constructor() {
    this.form = document.getElementById('foodListingForm');
    this.init();
  }

  init() {
    this.cacheElements();
    this.setupValidation();
    this.setupSubmission();
    console.log('✓ Food Listing Form initialized');
  }

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.elements = {
      form: this.form,
      donorPledge: document.getElementById('donorPledge'),
      preparedTime: document.getElementById('preparedTime'),
      refrigerated: document.getElementById('refrigerated'),
      pickupDeadline: document.getElementById('pickupDeadline'),
      foodType: document.getElementById('foodType'),
      quantity: document.getElementById('quantity'),
      location: document.getElementById('location'),
      donorName: document.getElementById('donorName'),
      donorPhone: document.getElementById('donorPhone'),
      donorEmail: document.getElementById('donorEmail'),
      
      timeWarning: document.getElementById('timeWarning'),
      refrigerationWarning: document.getElementById('refrigerationWarning'),
      deadlineWarning: document.getElementById('deadlineWarning'),
      
      submitBtn: document.querySelector('button[type="submit"]')
    };
  }

  /**
   * Setup form validation
   */
  setupValidation() {
    // Prepared time validation
    this.elements.preparedTime.addEventListener('change', () => this.validatePreparedTime());

    // Refrigeration warning
    this.elements.refrigerated.addEventListener('change', () => this.validateRefrigeration());

    // Pickup deadline validation
    this.elements.pickupDeadline.addEventListener('change', () => this.validatePickupDeadline());
  }

  /**
   * Validate prepared time
   */
  validatePreparedTime() {
    const preparedTime = new Date(this.elements.preparedTime.value);
    const now = new Date();
    const ageInHours = (now - preparedTime) / (1000 * 60 * 60);

    if (ageInHours > 6) {
      this.elements.timeWarning.style.display = 'block';
      this.elements.preparedTime.classList.add('input-error');
      return false;
    } else {
      this.elements.timeWarning.style.display = 'none';
      this.elements.preparedTime.classList.remove('input-error');
      return true;
    }
  }

  /**
   * Validate refrigeration
   */
  validateRefrigeration() {
    if (this.elements.refrigerated.value === 'no') {
      this.elements.refrigerationWarning.style.display = 'block';
    } else {
      this.elements.refrigerationWarning.style.display = 'none';
    }
  }

  /**
   * Validate pickup deadline
   */
  validatePickupDeadline() {
    const deadline = new Date(this.elements.pickupDeadline.value);
    const now = new Date();
    const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

    if (hoursUntilDeadline > 4 || hoursUntilDeadline < 0.5) {
      this.elements.deadlineWarning.style.display = 'block';
      this.elements.pickupDeadline.classList.add('input-error');
      return false;
    } else {
      this.elements.deadlineWarning.style.display = 'none';
      this.elements.pickupDeadline.classList.remove('input-error');
      return true;
    }
  }

  /**
   * Setup form submission
   */
  setupSubmission() {
    this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  /**
   * Handle form submission
   */
  handleSubmit(e) {
    e.preventDefault();

    // Validate pledge
    if (!this.elements.donorPledge.checked) {
      alert('❌ Please confirm the legal pledge to continue');
      return;
    }

    // Validate prepared time
    if (!this.validatePreparedTime()) {
      alert('❌ Food must be prepared within 6 hours');
      return;
    }

    // Validate refrigeration selection
    if (!this.elements.refrigerated.value) {
      alert('❌ Please select refrigeration status');
      return;
    }

    // Validate pickup deadline
    if (!this.validatePickupDeadline()) {
      alert('❌ Pickup deadline must be within 4 hours');
      return;
    }

    // Validate pickup deadline is after prepared time
    const preparedTime = new Date(this.elements.preparedTime.value);
    const deadline = new Date(this.elements.pickupDeadline.value);
    if (deadline <= preparedTime) {
      alert('❌ Pickup deadline must be after food preparation time');
      return;
    }

    // Collect form data
    const foodListing = {
      id: Date.now(),
      donorName: this.elements.donorName.value.trim(),
      donorPhone: this.elements.donorPhone.value.trim(),
      donorEmail: this.elements.donorEmail.value.trim() || null,
      foodType: this.elements.foodType.value.trim(),
      quantity: this.elements.quantity.value.trim(),
      location: this.elements.location.value.trim(),
      preparedTime: this.elements.preparedTime.value,
      refrigerated: this.elements.refrigerated.value,
      pickupDeadline: this.elements.pickupDeadline.value,
      allergens: this.getSelectedAllergens(),
      createdAt: new Date().toISOString(),
      status: 'available'
    };

    // Save to localStorage
    this.saveListing(foodListing);

    // Show success and redirect
    alert('✓ Food listing created successfully!\n\nYour surplus food is now visible to hungry families in your community.');
    
    // Reset form
    this.elements.form.reset();

    // Redirect
    setTimeout(() => {
      window.location.href = './available-food.html';
    }, 1500);
  }

  /**
   * Get selected allergens
   */
  getSelectedAllergens() {
    const checkboxes = document.querySelectorAll('input[name="allergens"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  /**
   * Save listing to localStorage
   */
  saveListing(listing) {
    let foodListings = JSON.parse(localStorage.getItem('foodListings')) || [];
    foodListings.push(listing);
    localStorage.setItem('foodListings', JSON.stringify(foodListings));
    console.log('✓ Listing saved to localStorage', listing);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.foodListingForm = new FoodListingForm();
});