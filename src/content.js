// Function to check if an element contains text and hasn't been translated
function needsTranslation(element) {
  return element.nodeType === Node.TEXT_NODE && element.textContent.trim().length > 5 && !element.parentElement.hasAttribute('data-translated');
}

// Function to handle the translation and display
async function translateAndDisplay(element) {
  const originalText = element.textContent;
  chrome.runtime.sendMessage({ action: 'translate', text: originalText }, (translatedText) => {
    if (translatedText) {
      const parentElement = element.parentElement;
      parentElement.setAttribute('data-translated', 'true');
      chrome.storage.local.get(['translationMode'], (result) => {
        if (result.translationMode === 'inline') {
          element.textContent = translatedText;
        } else {
          const tooltip = document.createElement('span');
          tooltip.className = 'translation-tooltip';
          tooltip.textContent = translatedText;
          parentElement.style.position = 'relative';
          parentElement.appendChild(tooltip);
        }
      });
    }
  });
}

// Use MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const textNodes = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        let currentNode;
        while (currentNode = textNodes.nextNode()) {
          if (needsTranslation(currentNode)) {
            translateAndDisplay(currentNode);
          }
        }
      } else if (needsTranslation(node)) {
        translateAndDisplay(node);
      }
    });
  });
});

// Start observing the body for changes
chrome.storage.local.get(['isLiveTranslationEnabled'], (result) => {
  if (result.isLiveTranslationEnabled) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

// Listen for changes in the extension's enabled state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.isLiveTranslationEnabled) {
    if (changes.isLiveTranslationEnabled.newValue) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      observer.disconnect();
    }
  }
});