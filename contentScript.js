chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'translate') {
    chrome.storage.sync.get('preferredLanguage', async (data) => {
      const targetLanguage = data.preferredLanguage || 'en';
      if ('translation' in self && 'createTranslator' in self.translation) {
        const translator = await translation.createTranslator({
          sourceLanguage: 'en',
          targetLanguage
        });
        const elementsToTranslate = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');

        // Show a spinner
        const spinner = document.createElement('div');
        spinner.id = 'translation-spinner';
        spinner.style.position = 'fixed';
        spinner.style.top = '50%';
        spinner.style.left = '50%';
        spinner.style.transform = 'translate(-50%, -50%)';
        spinner.style.zIndex = '9999';
        spinner.innerHTML = '<p>Translating... Please wait.</p>';
        document.body.appendChild(spinner);

        let texts = [];
        elementsToTranslate.forEach(el => {
          texts.push(el.innerText);
        });

        // Chunk the texts to handle large requests
        const chunkSize = 50;
        for (let i = 0; i < texts.length; i += chunkSize) {
          const chunk = texts.slice(i, i + chunkSize);
          const translatedTexts = await translator.translate(chunk);

          // Replace text in the elements
          for (let j = 0; j < chunk.length; j++) {
            elementsToTranslate[i + j].innerText = translatedTexts[j];
          }
        }

        // Remove spinner
        document.body.removeChild(spinner);

        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
    });
    return true; // Indicates we'll send a response asynchronously
  }
}); 