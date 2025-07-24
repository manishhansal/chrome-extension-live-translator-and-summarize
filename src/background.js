const GEMINI_API_KEY = '__GEMINI_API_KEY__';

// Function to call the Gemini API for translation
async function translateText(text) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "contents": [{
        "parts": [{
          "text": `Translate the following text to English: ${text}`
        }]
      }]
    }),
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}

// Function to call the Gemini API for summarization
async function summarizeText(text) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "contents": [{
        "parts": [{
          "text": `Summarize the following text concisely: ${text}`
        }]
      }]
    }),
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}

// Listen for messages from content scripts and the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    translateText(request.text).then(sendResponse);
    return true;
  } else if (request.action === 'summarize') {
    summarizeText(request.text).then(sendResponse);
    return true;
  }
});