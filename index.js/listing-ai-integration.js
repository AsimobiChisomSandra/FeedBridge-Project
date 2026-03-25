/**
 * FeedBridge AI Integration for Listing Form
 * Manages AI analysis data from AI Food Checker
 */

class ListingAIIntegration {
  constructor() {
    this.aiData = null;
    this.init();
  }

  init() {
    this.checkForSavedAnalysis();
    this.setupEventListeners();
  }

  /**
   * Check for saved AI analysis in localStorage
   */
  checkForSavedAnalysis() {
    const savedJSON = localStorage.getItem('foodAnalysis');

    if (!savedJSON) {
      this.showNoAIData();
      return;
    }

    try {
      this.aiData = JSON.parse(savedJSON);
      this.displayPrefilledData();
      this.autofillFoodType();
    } catch (error) {
      console.error('Failed to parse AI analysis:', error);
      this.showNoAIData();
    }
  }

  /**
   * Display pre-filled AI data
   */
  displayPrefilledData() {
    const loadedSection = document.getElementById('aiDataLoaded');
    const notLoadedSection = document.getElementById('aiDataNotLoaded');

    if (!this.aiData?.analysis) {
      this.showNoAIData();
      return;
    }

    const analysis = this.aiData.analysis;

    document.getElementById('prefilled-foodType').textContent = analysis.foodType || '--';
    document.getElementById('prefilled-freshness').textContent = analysis.freshnessLevel || '--';
    document.getElementById('prefilled-safety').textContent = analysis.safetyStatus || '--';
    document.getElementById('prefilled-allergens').textContent = analysis.allergen || 'None identified';

    loadedSection.style.display = 'block';
    notLoadedSection.style.display = 'none';
  }

  /**
   * Auto-fill food type from AI analysis
   */
  autofillFoodType() {
    const foodTypeInput = document.getElementById('foodType');
    if (foodTypeInput && this.aiData?.analysis?.foodType) {
      foodTypeInput.value = this.aiData.analysis.foodType;
      console.log('✓ Food type auto-filled from AI analysis');
    }
  }

  /**
   * Show no AI data state
   */
  showNoAIData() {
    const loadedSection = document.getElementById('aiDataLoaded');
    const notLoadedSection = document.getElementById('aiDataNotLoaded');

    if (loadedSection) loadedSection.style.display = 'none';
    if (notLoadedSection) notLoadedSection.style.display = 'block';
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const clearBtn = document.getElementById('clearAIBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAIData());
    }
  }

  /**
   * Clear AI data
   */
  clearAIData() {
    localStorage.removeItem('foodAnalysis');
    this.aiData = null;
    this.showNoAIData();
    console.log('✓ AI analysis cleared');
  }

  /**
   * Get saved AI analysis
   */
  getSavedAnalysis() {
    return this.aiData;
  }

  /**
   * Check if AI analysis exists
   */
  hasAIAnalysis() {
    return this.aiData !== null && this.aiData.analysis !== null;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.listingAIIntegration = new ListingAIIntegration();
});