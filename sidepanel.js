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
const userInputForm = document.getElementById('user-input-form');
const userInputField = document.getElementById('user-input');

let preferredLanguage = '';

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

// Load the saved language preference
async function loadPreferredLanguage() {
  console.log('Side Panel: Loading preferred language.');
  chrome.storage.sync.get('preferredLanguage', async (data) => {
    if (data.preferredLanguage) {
      console.log(`Side Panel: Preferred language is ${data.preferredLanguage}.`);
      languageSelectionSection.style.display = 'none';
      translationSection.style.display = 'block';
      preferredLanguage = data.preferredLanguage;
      //await updateUIToPreferredLanguage();
    } else {
      console.log('Side Panel: No preferred language set.');
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

// Function to update UI texts to the selected language
async function updateUIToPreferredLanguage() {
  const elementsToTranslate = document.querySelectorAll('.translatable');
  for (const element of elementsToTranslate) {
    const originalText = element.getAttribute('data-original-text') || element.textContent;
    element.setAttribute('data-original-text', originalText);
    const translatedText = await translateText(originalText, 'en', preferredLanguage);
    element.textContent = translatedText;
  }
}

// After translation is complete, add a message in the user's chosen language
async function showTranslationCompleteMessage() {
  const messagesContainer = document.getElementById('messages');
  const messageBubble = document.createElement('div');
  messageBubble.classList.add('message-bubble', 'assistant');
  const message = 'Translation completed successfully!';//await translateText('Translation completed successfully!', 'en', preferredLanguage);
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
        //await updateUIToPreferredLanguage();
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
    loadPreferredLanguage();
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Side Panel: Document loaded.');
  populateLanguages();
  await loadPreferredLanguage();

  // If the preferred language is set, update UI texts
  chrome.storage.sync.get('preferredLanguage', async (data) => {
    if (data.preferredLanguage) {
      preferredLanguage = data.preferredLanguage;
      //await updateUIToPreferredLanguage();
    }
  });
});

// Event listener for user input form
userInputForm.addEventListener('submit', handleUserInput); 