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
function loadPreferredLanguage() {
  console.log('Side Panel: Loading preferred language.');
  chrome.storage.sync.get('preferredLanguage', (data) => {
    if (data.preferredLanguage) {
      console.log(`Side Panel: Preferred language is ${data.preferredLanguage}.`);
      languageSelectionSection.style.display = 'none';
      translationSection.style.display = 'block';
    } else {
      console.log('Side Panel: No preferred language set.');
      languageSelectionSection.style.display = 'block';
      translationSection.style.display = 'none';
    }
  });
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
      chrome.storage.sync.set({ preferredLanguage: selectedLanguage }, () => {
        console.log('Side Panel: Preferred language saved.');
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
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log('Side Panel: Sending translate message to content script.');
    chrome.tabs.sendMessage(tabs[0].id, { action: 'translate' }, (response) => {
      if (response && response.success) {
        console.log('Side Panel: Translation succeeded.');
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
document.addEventListener('DOMContentLoaded', () => {
  console.log('Side Panel: Document loaded.');
  populateLanguages();
  loadPreferredLanguage();
}); 