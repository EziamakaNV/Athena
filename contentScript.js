const otMeta = document.createElement('meta');
otMeta.httpEquiv = 'origin-trial';
otMeta.content = 'Ap2oR6Rg+2cJ51jXe5leCspfiX79lI7ocrCVEf+kSN5vVsj7uGpwRGExtNAxPekjkyGORFXiLTbxJVZFZBaaHQYAAABleyJvcmlnaW4iOiJodHRwczovL21lZGl1bS5jb206NDQzIiwiZmVhdHVyZSI6IlRyYW5zbGF0aW9uQVBJIiwiZXhwaXJ5IjoxNzUzMTQyNDAwLCJpc1N1YmRvbWFpbiI6dHJ1ZX0=';
document.head.append(otMeta);


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'translate') {
    console.log('Content Script: Received translate message.');
    chrome.storage.sync.get('preferredLanguage', async (data) => {
      const targetLanguage = data.preferredLanguage || 'en';
      console.log(`Content Script: Preferred language is ${targetLanguage}.`);
      
      if ('translation' in self && 'createTranslator' in self.translation) {
        console.log('Content Script: Translation API is available.');
        const translator = await translation.createTranslator({
          sourceLanguage: 'en',
          targetLanguage
        });
        console.log('Content Script: Translator created.');
        
        const elementsToTranslate = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
        console.log(`Content Script: Found ${elementsToTranslate.length} elements to translate.`);

        // Show a spinner
        const spinner = document.createElement('div');
        spinner.id = 'translation-spinner';
        spinner.style.position = 'fixed';
        spinner.style.top = '50%';
        spinner.style.left = '50%';
        spinner.style.transform = 'translate(-50%, -50%)';
        spinner.style.zIndex = '9999';
        spinner.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        spinner.style.padding = '20px';
        spinner.style.borderRadius = '10px';
        spinner.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        
        const spinnerAnimation = document.createElement('div');
        spinnerAnimation.style.width = '40px';
        spinnerAnimation.style.height = '40px';
        spinnerAnimation.style.margin = '0 auto 10px';
        spinnerAnimation.style.border = '4px solid #f3f3f3';
        spinnerAnimation.style.borderTop = '4px solid #ff9966';
        spinnerAnimation.style.borderRadius = '50%';
        spinnerAnimation.style.animation = 'spin 1s linear infinite';
        
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
        
        const text = document.createElement('p');
        text.textContent = 'Translating... Please wait.';//await translator.translate('Translating... Please wait.');
        text.classList.add('translatable');
        text.style.margin = '0';
        text.style.fontFamily = 'Inter, sans-serif';
        text.style.color = '#333';
        
        spinner.appendChild(spinnerAnimation);
        spinner.appendChild(text);
        document.body.appendChild(spinner);

        try {
          // Translate each element individually
          for (const element of elementsToTranslate) {
            const text = element.innerText;
            console.log(`Content Script: Translating element with text: ${text.substring(0, 50)}...`);
            
            try {
              const translatedText = await translator.translate(text);
              element.innerText = translatedText;
            } catch (elementError) {
              console.error('Content Script: Failed to translate element:', elementError);
              // Continue with other elements if one fails
            }
          }

          console.log('Content Script: Translation completed.');
          sendResponse({ success: true });
        } catch (error) {
          console.error('Content Script: Translation failed:', error);
          sendResponse({ success: false });
        } finally {
          // Remove spinner
          document.body.removeChild(spinner);
        }
      } else {
        console.error('Content Script: Translation API not available.');
        sendResponse({ success: false });
      }
    });
    return true; // Indicates we'll send a response asynchronously
  }
}); 