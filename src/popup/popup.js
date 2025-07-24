document.addEventListener('DOMContentLoaded', () => {
  const liveTranslationToggle = document.getElementById('live-translation-toggle');
  const inlineRadio = document.getElementById('inline');
  const tooltipRadio = document.getElementById('tooltip');
  const summarizeBtn = document.getElementById('summarize-btn');
  const summaryContainer = document.getElementById('summary-container');
  const summaryText = document.getElementById('summary-text');
  const copySummaryBtn = document.getElementById('copy-summary-btn');

  // Load saved settings
  chrome.storage.local.get(['isLiveTranslationEnabled', 'translationMode'], (result) => {
    liveTranslationToggle.checked = !!result.isLiveTranslationEnabled;
    if (result.translationMode === 'inline') {
      inlineRadio.checked = true;
    } else {
      tooltipRadio.checked = true;
    }
  });

  // Save settings on change
  liveTranslationToggle.addEventListener('change', () => {
    chrome.storage.local.set({ isLiveTranslationEnabled: liveTranslationToggle.checked });
  });

  inlineRadio.addEventListener('change', () => {
    if (inlineRadio.checked) {
      chrome.storage.local.set({ translationMode: 'inline' });
    }
  });

  tooltipRadio.addEventListener('change', () => {
    if (tooltipRadio.checked) {
      chrome.storage.local.set({ translationMode: 'tooltip' });
    }
  });

  // Summarize page content
  summarizeBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          return Array.from(document.querySelectorAll('[data-translated]')).map(el => el.textContent).join('\n');
        }
      }, (injectionResults) => {
        const allTranslatedText = injectionResults[0].result;
        if (allTranslatedText) {
          chrome.runtime.sendMessage({ action: 'summarize', text: allTranslatedText }, (summary) => {
            summaryText.textContent = summary;
            summaryContainer.style.display = 'block';
          });
        }
      });
    });
  });

  // Copy summary to clipboard
  copySummaryBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(summaryText.textContent);
  });
});