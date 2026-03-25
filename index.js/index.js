const startNowBtn = document.getElementById('startNowBtn');
const roleDropdown = document.getElementById('roleDropdown');

// Toggle dropdown on Start Now click
startNowBtn.addEventListener('click', function(e) {
  e.preventDefault();
  if (roleDropdown.style.display === 'none') {
    roleDropdown.style.display = 'block';
  } else {
    roleDropdown.style.display = 'none';
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.role-selector')) {
    roleDropdown.style.display = 'none';
  }
});

// AI analysis function (from listing form)
async function analyzeFood(imageBase64) {
  const resultDiv = document.getElementById('aiAnalysisResult');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Analyze this food image in a brief way (2-3 sentences). Tell: (1) What food type is it? (2) How fresh does it appear? (3) Is it safe to eat based on appearance? Format: Food Type: [answer] | Freshness: [answer] | Safety: [answer]"
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageBase64.split(',')[1]
                }
              }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]) {
      const aiText = data.candidates[0].content.parts[0].text;
      if (resultDiv) {
        document.getElementById('aiText').textContent = aiText;
        resultDiv.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('AI Analysis error:', error);
  }
}