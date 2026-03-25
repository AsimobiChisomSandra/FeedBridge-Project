/**
 * FeedBridge AI Food Checker
 * Professional food safety analysis using Google Gemini Vision API
 */

class AiFoodChecker {
  constructor() {
    this.currentImageBase64 = null;
    this.analysisData = null;
    this.init();
  }

  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.addDebugLog('AI Food Checker initialized', 'success');
  }

  /**
   * Cache all DOM elements for performance
   */
  cacheElements() {
    this.elements = {
      uploadArea: document.getElementById('uploadArea'),
      foodImageInput: document.getElementById('foodImageInput'),
      uploadState: document.getElementById('uploadState'),
      previewState: document.getElementById('previewState'),
      loadingState: document.getElementById('loadingState'),
      errorState: document.getElementById('errorState'),
      resultsState: document.getElementById('resultsState'),
      
      foodImagePreview: document.getElementById('foodImagePreview'),
      fileInfo: document.getElementById('fileInfo'),
      
      analyzeBtn: document.getElementById('analyzeBtn'),
      changeImageBtn: document.getElementById('changeImageBtn'),
      retryBtn: document.getElementById('retryBtn'),
      useFoodBtn: document.getElementById('useFoodBtn'),
      analyzeAnotherBtn: document.getElementById('analyzeAnotherBtn'),
      analyzeAnotherBtn2: document.getElementById('analyzeAnotherBtn2'),
      
      errorMessage: document.getElementById('errorMessage'),
      
      foodTypeResult: document.getElementById('foodTypeResult'),
      safetyStatusResult: document.getElementById('safetyStatusResult'),
      freshnessResult: document.getElementById('freshnessResult'),
      shelfLifeResult: document.getElementById('shelfLifeResult'),
      allergenResult: document.getElementById('allergenResult'),
      recommendationResult: document.getElementById('recommendationResult'),
      fullAnalysisText: document.getElementById('fullAnalysisText'),
      
      debugSection: document.getElementById('debugSection'),
      debugLog: document.getElementById('debugLog')
    };

    // Validate critical elements exist
    if (!this.elements.uploadArea) {
      console.error('❌ CRITICAL: uploadArea element not found in DOM');
    }
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Validate elements before adding listeners
    if (!this.elements.uploadArea) {
      console.error('❌ Cannot setup listeners - uploadArea missing');
      return;
    }

    // Upload area
    this.elements.uploadArea.addEventListener('click', () => {
      console.log('Upload area clicked');
      this.elements.foodImageInput.click();
    });

    this.elements.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.elements.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    this.elements.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
    
    // File input - CRITICAL
    this.elements.foodImageInput.addEventListener('change', (e) => {
      console.log('File input changed:', e.target.files[0]);
      this.handleFileSelect(e.target.files[0]);
    });
    
    // Buttons
    if (this.elements.analyzeBtn) {
      this.elements.analyzeBtn.addEventListener('click', () => this.analyzeFood());
    }
    if (this.elements.changeImageBtn) {
      this.elements.changeImageBtn.addEventListener('click', () => this.resetToUpload());
    }
    if (this.elements.retryBtn) {
      this.elements.retryBtn.addEventListener('click', () => this.resetToPreview());
    }
    if (this.elements.useFoodBtn) {
      this.elements.useFoodBtn.addEventListener('click', () => this.saveAndRedirect());
    }
    if (this.elements.analyzeAnotherBtn) {
      this.elements.analyzeAnotherBtn.addEventListener('click', () => this.resetToUpload());
    }
    if (this.elements.analyzeAnotherBtn2) {
      this.elements.analyzeAnotherBtn2.addEventListener('click', () => this.resetToUpload());
    }
    
    // Debug toggle (Shift+D)
    document.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.key === 'D') {
        this.toggleDebug();
      }
    });

    console.log('✓ Event listeners setup complete');
  }

  /**
   * Handle drag over
   */
  handleDragOver(e) {
    e.preventDefault();
    this.elements.uploadArea.style.backgroundColor = '#e8f5e9';
    this.elements.uploadArea.style.borderColor = 'rgb(16, 153, 16)';
  }

  /**
   * Handle drag leave
   */
  handleDragLeave(e) {
    e.preventDefault();
    this.elements.uploadArea.style.backgroundColor = '';
    this.elements.uploadArea.style.borderColor = '';
  }

  /**
   * Handle drop
   */
  handleDrop(e) {
    e.preventDefault();
    this.elements.uploadArea.style.backgroundColor = '';
    this.elements.uploadArea.style.borderColor = '';
    this.handleFileSelect(e.dataTransfer.files[0]);
  }

  /**
   * Handle file selection
   */
  handleFileSelect(file) {
    if (!file) {
      this.addDebugLog('No file selected', 'warn');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showError('Please select an image file (JPG, PNG, WebP)');
      this.addDebugLog(`Invalid file type: ${file.type}`, 'error');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showError(`Image must be smaller than 5MB (yours is ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      this.addDebugLog(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`, 'error');
      return;
    }

    this.addDebugLog(`✓ File selected: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)}KB)`, 'success');

    const reader = new FileReader();

    reader.onload = (e) => {
      this.currentImageBase64 = e.target.result;
      console.log('FileReader onload - base64 ready');
      this.addDebugLog(`✓ Image encoded successfully (${this.currentImageBase64.length} bytes)`);
      this.showPreview(file);
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      this.showError('Failed to read file. Please try again.');
      this.addDebugLog('FileReader error: ' + error.message, 'error');
    };

    reader.readAsDataURL(file);
  }

  /**
   * Show preview state
   */
  showPreview(file) {
    console.log('Showing preview...');
    this.elements.foodImagePreview.src = this.currentImageBase64;
    this.elements.fileInfo.innerHTML = `
      <strong>📄 File:</strong> ${file.name}<br>
      <strong>📊 Type:</strong> ${file.type}<br>
      <strong>💾 Size:</strong> ${(file.size / 1024).toFixed(2)}KB<br>
      <span style="color: rgb(26, 228, 26); font-weight: bold;">✓ Ready to analyze</span>
    `;

    this.showState('previewState');
  }

  /**
   * Show specific state
   */
  showState(stateName) {
    console.log('Changing state to:', stateName);
    this.elements.uploadState.style.display = 'none';
    this.elements.previewState.style.display = 'none';
    this.elements.loadingState.style.display = 'none';
    this.elements.errorState.style.display = 'none';
    this.elements.resultsState.style.display = 'none';

    const targetState = document.getElementById(stateName);
    if (targetState) {
      targetState.style.display = 'block';
      console.log('✓ State changed to:', stateName);
    } else {
      console.error('❌ State element not found:', stateName);
    }
  }

  /**
   * Analyze food with Gemini API - FIXED MODEL NAME
   */
  async analyzeFood() {
    if (!this.currentImageBase64) {
      this.showError('Please select an image first');
      return;
    }

    if (!GEMINI_API_KEY) {
      this.showError('API key not configured. Check config.js');
      this.addDebugLog('GEMINI_API_KEY is undefined', 'error');
      return;
    }

    if (GEMINI_API_KEY.includes('YOUR_')) {
      this.showError('API key contains placeholder. Set real API key in config.js');
      this.addDebugLog('GEMINI_API_KEY contains placeholder', 'error');
      return;
    }

    this.showState('loadingState');
    this.addDebugLog('🔄 Starting food analysis...', 'info');

    try {
      // Extract base64 data
      const base64Data = this.currentImageBase64.includes(',')
        ? this.currentImageBase64.split(',')[1]
        : this.currentImageBase64;

      this.addDebugLog(`Base64 data prepared (${base64Data.length} chars)`, 'info');

      const prompt = `You are a professional food safety expert. Analyze this food image ONLY based on what you can visually see. Provide your response in this EXACT format (do not deviate):

FOOD TYPE: [name of food]
FRESHNESS LEVEL: [Very Fresh | Fresh | Moderately Fresh | Aging | Old]
SAFETY STATUS: [Safe to Eat | Consume with Caution | Not Safe]
ESTIMATED SHELF LIFE: [e.g., "2-3 hours at room temp" or "3-4 days refrigerated"]
ALLERGEN ADVISORY: [list allergens or "None identified"]
RECOMMENDATION: [specific action]
DETAILED ANALYSIS: [2-3 sentences about color, texture, condition, any signs of spoilage]`;

      this.addDebugLog('📤 Sending request to Gemini API...', 'info');

      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }]
      };

      console.log('API Request body prepared, sending...');

      // FIXED: Use correct API endpoint and model
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      this.addDebugLog(`API URL: ${apiUrl.substring(0, 80)}...`, 'info');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      this.addDebugLog(`📥 API Response: ${response.status} ${response.statusText}`, 'info');

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
        throw new Error(`API Error: ${errorMsg}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid API response structure');
      }

      const analysisText = data.candidates[0].content.parts[0].text;
      this.addDebugLog('✓ Analysis received from API', 'success');

      this.analysisData = this.parseAnalysis(analysisText);
      this.displayResults(analysisText);

    } catch (error) {
      this.addDebugLog(`❌ Error: ${error.message}`, 'error');
      console.error('Full error:', error);
      this.showError(error.message);
    }
  }

  /**
   * Parse API response
   */
  parseAnalysis(text) {
    const extract = (label) => {
      const regex = new RegExp(`${label}:\\s*(.+?)(?=\\n|$)`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : 'Not provided';
    };

    return {
      foodType: extract('FOOD TYPE'),
      freshnessLevel: extract('FRESHNESS LEVEL'),
      safetyStatus: extract('SAFETY STATUS'),
      shelfLife: extract('ESTIMATED SHELF LIFE'),
      allergen: extract('ALLERGEN ADVISORY'),
      recommendation: extract('RECOMMENDATION'),
      detailed: extract('DETAILED ANALYSIS')
    };
  }

  /**
   * Display analysis results
   */
  displayResults(fullText) {
    this.elements.foodTypeResult.textContent = this.analysisData.foodType;
    this.elements.safetyStatusResult.textContent = this.analysisData.safetyStatus;
    this.elements.freshnessResult.textContent = this.analysisData.freshnessLevel;
    this.elements.shelfLifeResult.textContent = this.analysisData.shelfLife;
    this.elements.allergenResult.textContent = this.analysisData.allergen;
    this.elements.recommendationResult.textContent = this.analysisData.recommendation;
    this.elements.fullAnalysisText.textContent = fullText;

    this.showState('resultsState');
    this.addDebugLog('✓ Results displayed successfully', 'success');
  }

  /**
   * Show error state
   */
  showError(message) {
    console.error('Showing error:', message);
    this.elements.errorMessage.textContent = message;
    this.showState('errorState');
  }

  /**
   * Reset to upload
   */
  resetToUpload() {
    this.currentImageBase64 = null;
    this.analysisData = null;
    this.elements.foodImageInput.value = '';
    this.showState('uploadState');
    this.addDebugLog('🔄 Reset to upload state', 'info');
  }

  /**
   * Reset to preview
   */
  resetToPreview() {
    this.showState('previewState');
  }

  /**
   * Save analysis and redirect
   */
  saveAndRedirect() {
    if (!this.analysisData) {
      this.showError('No analysis data to save');
      return;
    }

    const dataToSave = {
      imageBase64: this.currentImageBase64,
      analysis: this.analysisData,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('foodAnalysis', JSON.stringify(dataToSave));
    this.addDebugLog('💾 Analysis saved to localStorage', 'success');

    alert('✓ Analysis saved! Redirecting to listing form...');
    setTimeout(() => {
      window.location.href = './listing.html';
    }, 500);
  }

  /**
   * Debug logging
   */
  addDebugLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.style.marginBottom = '0.5rem';
    entry.style.padding = '0.8rem';
    entry.style.borderRadius = '4px';
    entry.style.fontFamily = 'monospace';
    entry.style.fontSize = '0.9rem';
    
    if (type === 'error') {
      entry.style.backgroundColor = '#ffebee';
      entry.style.color = '#e53935';
      entry.style.borderLeft = '3px solid #e53935';
    } else if (type === 'success') {
      entry.style.backgroundColor = '#e8f5e9';
      entry.style.color = '#2e7d32';
      entry.style.borderLeft = '3px solid #2e7d32';
    } else if (type === 'warn') {
      entry.style.backgroundColor = '#fff3e0';
      entry.style.color = '#e65100';
      entry.style.borderLeft = '3px solid #ff9800';
    } else {
      entry.style.backgroundColor = '#f5f5f5';
      entry.style.color = '#666';
      entry.style.borderLeft = '3px solid #9e9e9e';
    }

    entry.textContent = `[${timestamp}] ${message}`;
    this.elements.debugLog.appendChild(entry);
    this.elements.debugLog.scrollTop = this.elements.debugLog.scrollHeight;
    
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  /**
   * Toggle debug visibility
   */
  toggleDebug() {
    const isHidden = this.elements.debugSection.style.display === 'none';
    this.elements.debugSection.style.display = isHidden ? 'block' : 'none';
    console.log('Debug panel toggled:', isHidden ? 'SHOWN' : 'HIDDEN');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - initializing AI Food Checker');
  window.aiFoodChecker = new AiFoodChecker();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('Document still loading, waiting for DOMContentLoaded');
} else {
  console.log('Document already loaded, initializing immediately');
  window.aiFoodChecker = new AiFoodChecker();
}