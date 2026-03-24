/**
 * FeedBridge Configuration
 * API Keys and Global Settings
 */

// IMPORTANT: Your API Key
// Get it from: https://aistudio.google.com/app/apikeys
const GEMINI_API_KEY = "AIzaSyB8MerLe9A0IQ5QxewueDXRX7rO2X6UE9g";

// Model configuration - using gemini-1.5-flash (stable and supported)
const GEMINI_MODEL = "gemini-1.5-flash";

// API Endpoint
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

// Validate on load
document.addEventListener('DOMContentLoaded', () => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_') || GEMINI_API_KEY.length < 30) {
    console.warn('⚠️ GEMINI_API_KEY is not configured properly');
    console.warn('Get a free API key from: https://aistudio.google.com/app/apikeys');
  } else {
    console.log('✓ API Configuration loaded');
    console.log('✓ Model: ' + GEMINI_MODEL);
  }
});