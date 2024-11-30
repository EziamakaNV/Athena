# Athena Chrome Extension

Athena is a Chrome extension that breaks down language barriers on Medium.com, making content accessible to readers worldwide and helping writers reach a global audience.

## Why Athena?

Medium.com hosts millions of articles, but according to Medium's official documentation, the majority of content is written in English. This creates two significant challenges:

1. **Reader Accessibility**: Many potential readers who aren't fluent in English are excluded from accessing valuable content, insights, and knowledge shared on Medium.

2. **Writer Limitations**: Writers who are more comfortable writing in their native language face barriers in reaching Medium's predominantly English-speaking audience, limiting their ability to:
   - Share their expertise with a global readership
   - Build an international following
   - Participate in Medium's Partner Program for earning potential

Athena solves these challenges by providing:
- Real-time translation of English articles for readers
- Translation support for writers creating content in their native language
- On-device translation using Chrome's AI Translation API for privacy and performance

## Features

- Translates English articles on Medium.com to the user's selected language
- Provides a user-friendly chat interface in the side panel
- Translates all UI elements to the user's preferred language
- Offers a writing mode to translate content from any language to English
- Uses Chrome's on-device AI Translation for secure and fast translations

## Installation

1. **Clone or download this repository** to your local machine.

2. **Get the Origin Trial Token**:
   - Visit the [Translator API Origin Trial](https://developer.chrome.com/docs/ai/translator-api/) page.
   - Register your extension ID to receive the Origin Trial token.
   - Replace the placeholder token in `contentScript.js` with your token.

3. **Load the Extension in Chrome**:
   - Open Google Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" by toggling the switch in the top right corner.
   - Click on "Load unpacked" and select the directory where you downloaded the extension.
   - The extension "Athena" should now appear in your list of extensions.

4. **Enable Side Panel**:
   - Ensure that the Chrome Side Panel feature is enabled in your browser.

## Usage

1. **Navigate to any article on Medium.com**.

2. **Click on the Athena extension icon** in the Chrome toolbar.

3. The **side panel will open** with Athena's chat interface.

4. If this is your first time using the extension, **select your preferred language** from the dropdown and click "Save Language".

5. Click **"Translate Article"** to translate the current Medium article into your preferred language.

6. After translation, **all UI texts in the side panel will also be translated** into your preferred language.

7. **Writing Mode on Medium.com**:

   - When you navigate to Medium's article creation pages (`https://medium.com/p/*/edit` or `https://medium.com/new-story`), Athena will switch to writing mode.
   - **In Writing Mode**:
     - Write your article in your preferred language as normal.
     - Open the side panel, and you'll see a message indicating you're in writing mode.
     - When you're ready, click the **"Translate My Writing"** button in the side panel.
     - Your content will be translated into English directly in the editor.

8. **Switching Back to Reading Mode**:

   - When you navigate away from the writing pages, Athena will switch back to reading mode automatically.
   - The side panel will return to its previous state, allowing you to translate articles and interact as before.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
