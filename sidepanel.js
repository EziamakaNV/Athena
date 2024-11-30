const supportedLanguages = [
  'ja',
  'es',
];

const languageSelect = document.getElementById('language');
const saveLanguageButton = document.getElementById('save-language');
const translateButton = document.getElementById('translate-button');
const resetLanguageButton = document.getElementById('reset-language');
const translationSection = document.getElementById('translation-section');
const languageSelectionSection = document.getElementById('language-selection');
const loadingSection = document.getElementById('loading');
const userInputField = document.getElementById('user-input');
const writingModeSection = document.getElementById('writing-mode-section');
const writingTranslateButton = document.getElementById('writing-translate-button');

let preferredLanguage = '';
let uiLanguage = 'preferred';
let currentMode = 'reading';

// Populate the language selection dropdown
function populateLanguages() {
  console.log('Side Panel: Populating language selection.');
  supportedLanguages.forEach(langCode => {
    const option = document.createElement('option');
    option.value = langCode;
    option.textContent = languageTagToHumanReadable(langCode, navigator.language);
    languageSelect.appendChild(option);
    console.log(`Side Panel: Added language option ${option.textContent}.`);
  });
}

// Use Intl.DisplayNames to convert language codes to human-readable names
function languageTagToHumanReadable(languageTag, targetLanguage) {
  const displayNames = new Intl.DisplayNames([targetLanguage], { type: "language" });
  return displayNames.of(languageTag);
}

// Load the saved language and UI preferences
async function loadPreferences() {
  console.log('Side Panel: Loading preferences.');
  chrome.storage.sync.get(['preferredLanguage', 'uiLanguage'], async (data) => {
    if (data.preferredLanguage) {
      console.log(`Side Panel: Preferred language is ${data.preferredLanguage}.`);
      preferredLanguage = data.preferredLanguage;
      uiLanguage = data.uiLanguage || 'preferred';
      await updateUIToPreferredLanguage();
      updateToggleButtonText();

      languageSelectionSection.style.display = 'none';
      translationSection.style.display = 'block';
    } else {
      languageSelectionSection.style.display = 'block';
      translationSection.style.display = 'none';
    }
  });
}

// Function to translate text using the Translation API
async function translateText(text, sourceLanguage, targetLanguage) {
  if ('translation' in self && 'createTranslator' in self.translation) {
    const translator = await translation.createTranslator({
      sourceLanguage,
      targetLanguage,
    });
    const translatedText = await translator.translate(text);
    return translatedText;
  } else {
    console.error('Translation API not available.');
    return text;
  }
}

// Function to update UI texts based on UI language preference
async function updateUIToPreferredLanguage() {
  const elementsToTranslate = document.querySelectorAll('.translatable');
  for (const element of elementsToTranslate) {
    const originalText = element.getAttribute('data-original-text') || element.textContent;
    element.setAttribute('data-original-text', originalText);

    if (uiLanguage === 'preferred') {
      const translatedText = await translateText(originalText, 'en', preferredLanguage);
      element.textContent = translatedText;
    } else {
      element.textContent = originalText;
    }
  }
}

// Function to update the toggle button text
function updateToggleButtonText() {
  const toggleButton = document.getElementById('toggle-language-button');
  if (uiLanguage === 'preferred') {
    toggleButton.textContent = 'Switch to English';
  } else {
    toggleButton.textContent = `Switch to ${languageTagToHumanReadable(preferredLanguage, navigator.language)}`;
  }
}

// After translation is complete, add a message in the user's chosen language
async function showTranslationCompleteMessage() {
  const messagesContainer = document.getElementById('messages');
  const messageBubble = document.createElement('div');
  messageBubble.classList.add('message-bubble', 'assistant');
  const message = await translateText('Translation completed successfully!', 'en', preferredLanguage);
  messageBubble.innerHTML = `<p>${message}</p>`;
  messagesContainer.appendChild(messageBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to translate user input from preferred language to English
async function handleUserInput(event) {
  event.preventDefault();
  const userInput = userInputField.value.trim();
  if (userInput === '') return;

  // Display user message in chat
  displayUserMessage(userInput);

  // Translate user input to English
  const translatedText = await translateText(userInput, preferredLanguage, 'en');
  
  // Display translated message in chat
  displayAssistantMessage(translatedText);

  userInputField.value = '';
}

function displayUserMessage(message) {
  const messagesContainer = document.getElementById('messages');
  const messageBubble = document.createElement('div');
  messageBubble.classList.add('message-bubble', 'user');
  messageBubble.innerHTML = `<p>${message}</p>`;
  messagesContainer.appendChild(messageBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function displayAssistantMessage(message) {
  const messagesContainer = document.getElementById('messages');
  const messageBubble = document.createElement('div');
  messageBubble.classList.add('message-bubble', 'assistant');
  messageBubble.innerHTML = `<p>${message}</p>`;
  messagesContainer.appendChild(messageBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Save the preferred language
saveLanguageButton.addEventListener('click', async () => {
  const selectedLanguage = languageSelect.value;
  console.log(`Side Panel: User selected language ${selectedLanguage}.`);

  if ('translation' in self && 'canTranslate' in self.translation) {
    const result = await translation.canTranslate({ sourceLanguage: 'en', targetLanguage: selectedLanguage });
    const canTranslate = result !== 'no';
    console.log(`Side Panel: Can translate to ${selectedLanguage}: ${canTranslate}`);

    if (canTranslate) {
      console.log(`Side Panel: Translation to ${selectedLanguage} is available.`);
      chrome.storage.sync.set({ preferredLanguage: selectedLanguage }, async () => {
        console.log('Side Panel: Preferred language saved.');
        preferredLanguage = selectedLanguage;
        await updateUIToPreferredLanguage();
        languageSelectionSection.style.display = 'none';
        translationSection.style.display = 'block';
      });
    } else {
      console.error(`Side Panel: Translation to ${selectedLanguage} is not available.`);
      alert('Translation to this language is not currently available.');
    }
  } else {
    console.error('Side Panel: Translation API not available.');
    alert('Translation API is not available.');
  }
});

// Translate the article
translateButton.addEventListener('click', () => {
  console.log('Side Panel: Translate button clicked.');
  translationSection.style.display = 'none';
  loadingSection.style.display = 'block';
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    console.log('Side Panel: Sending translate message to content script.');
    chrome.tabs.sendMessage(tabs[0].id, { action: 'translate' }, async (response) => {
      if (response && response.success) {
        console.log('Side Panel: Translation succeeded.');
        await showTranslationCompleteMessage();
      } else {
        console.error('Side Panel: Translation failed.');
      }
      loadingSection.style.display = 'none';
      translationSection.style.display = 'block';
    });
  });
});

// Reset preferred language
resetLanguageButton.addEventListener('click', () => {
  console.log('Side Panel: Reset language button clicked.');
  chrome.storage.sync.remove('preferredLanguage', () => {
    console.log('Side Panel: Preferred language removed.');
    loadPreferences();
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'switchSidePanelMode') {
    currentMode = message.mode;
    updateUIMode();
  }
});

// Function to update UI based on mode
function updateUIMode() {
  if (currentMode === 'writing') {
    console.log('Side Panel: Switched to writing mode.');
    // Display writing mode UI
    translationSection.style.display = 'none';
    languageSelectionSection.style.display = 'none';
    loadingSection.style.display = 'none';
    writingModeSection.style.display = 'block';
  } else {
    console.log('Side Panel: Switched to reading mode.');
    // Display reading mode UI
    writingModeSection.style.display = 'none';
    // Restore previous UI based on whether preferred language is set
    chrome.storage.sync.get('preferredLanguage', async (data) => {
      if (data.preferredLanguage) {
        languageSelectionSection.style.display = 'none';
        translationSection.style.display = 'block';
      } else {
        languageSelectionSection.style.display = 'block';
        translationSection.style.display = 'none';
      }
    });
  }
}

// New function to handle translation in writing mode
async function translateWritingContent() {
  console.log('Side Panel: Translating writing content.');
  if ('translation' in self && 'createTranslator' in self.translation) {
    const translator = await translation.createTranslator({
      sourceLanguage: preferredLanguage,
      targetLanguage: 'en',
    });

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'translateWriting', preferredLanguage }, async (response) => {
        if (response && response.success) {
          console.log('Side Panel: Writing content translated.');
          // Provide feedback to the user
          showTranslationCompleteMessage();
        } else {
          console.error('Side Panel: Failed to translate writing content.');
        }
      });
    });
  } else {
    console.error('Translation API not available.');
  }
}

// Event listener for writing mode translate button
writingTranslateButton.addEventListener('click', translateWritingContent);

// Event listener for toggle button
document.getElementById('toggle-language-button').addEventListener('click', () => {
  uiLanguage = uiLanguage === 'preferred' ? 'en' : 'preferred';

  // Save the UI language preference
  chrome.storage.sync.set({ uiLanguage }, () => {
    console.log(`Side Panel: UI language preference saved as ${uiLanguage}.`);
  });

  // Update UI texts and button text
  updateUIToPreferredLanguage();
  updateToggleButtonText();
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Side Panel: Document loaded.');
  populateLanguages();
  await loadPreferences();

  // Get current tab to set mode
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab.url && tab.url.match(/^https:\/\/medium\.com\/(p\/.*\/edit|new-story)/)) {
      currentMode = 'writing';
    } else {
      currentMode = 'reading';
    }
    updateUIMode();
  });
});