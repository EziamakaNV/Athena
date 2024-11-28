const supportedLanguages = [
  'en',
  'zh',
  'zh-Hant',
  'ja',
  'pt',
  'ru',
  'es',
  'tr',
  'hi',
  'vi',
  'bn'
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
  supportedLanguages.forEach(langCode => {
    const option = document.createElement('option');
    option.value = langCode;
    option.textContent = languageTagToHumanReadable(langCode, navigator.language);
    languageSelect.appendChild(option);
  });
}

// Use Intl.DisplayNames to convert language codes to human-readable names
function languageTagToHumanReadable(languageTag, targetLanguage) {
  const displayNames = new Intl.DisplayNames([targetLanguage], { type: "language" });
  return displayNames.of(languageTag);
}

// Load the saved language preference
function loadPreferredLanguage() {
  chrome.storage.sync.get('preferredLanguage', (data) => {
    if (data.preferredLanguage) {
      languageSelectionSection.style.display = 'none';
      translationSection.style.display = 'block';
    } else {
      languageSelectionSection.style.display = 'block';
      translationSection.style.display = 'none';
    }
  });
}

// Save the preferred language
saveLanguageButton.addEventListener('click', () => {
  const selectedLanguage = languageSelect.value;
  chrome.runtime.sendMessage({ action: 'checkTranslation', targetLanguage: selectedLanguage }, (response) => {
    if (response.canTranslate) {
      chrome.storage.sync.set({ preferredLanguage: selectedLanguage });
      languageSelectionSection.style.display = 'none';
      translationSection.style.display = 'block';
    } else {
      alert('Translation to this language is not currently available.');
    }
  });
});

// Translate the article
translateButton.addEventListener('click', () => {
  translationSection.style.display = 'none';
  loadingSection.style.display = 'block';
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'translate' }, (response) => {
      loadingSection.style.display = 'none';
      translationSection.style.display = 'block';
    });
  });
});

// Reset preferred language
resetLanguageButton.addEventListener('click', () => {
  chrome.storage.sync.remove('preferredLanguage', () => {
    loadPreferredLanguage();
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  populateLanguages();
  loadPreferredLanguage();
}); 