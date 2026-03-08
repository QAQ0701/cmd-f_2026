# Loading an Unpacked Chrome Extension

This guide explains how to load and test your Chrome extension without publishing it to the Chrome Web Store.

## Steps

### 1. Prepare Your Extension Folder
Make sure your extension folder contains at least the following:

- `manifest.json` — the extension manifest file.
- Other assets (HTML, CSS, JS, images) required by your extension.
- Ensure your `manifest.json` is valid and matches your Chrome version requirements (Manifest V3 is standard now).

### 2. Open Chrome Extensions Page
1. Open Google Chrome.
2. Go to the extensions page by navigating to:  chrome://extensions/
or click the menu → **More Tools** → **Extensions**.

### 3. Enable Developer Mode
- Toggle **Developer mode** in the top-right corner of the page.

### 4. Load Your Unpacked Extension
1. Click **Load unpacked**.
2. Navigate to your extension folder (the one containing `manifest.json`) and select it.
3. Your extension should appear in the list of extensions.  
- If there are errors, Chrome will highlight them. Check the console in the extensions page for details.

### 5. Test Your Extension
- **Browser action / popup**: Click the extension icon in the toolbar.
- **Content scripts**: Visit a web page that matches your content script rules.
- **Background scripts**: Check logs in the **Extensions → Background page** console.

### 6. Reload After Changes
- After making changes to your extension code:
1. Return to `chrome://extensions/`.
2. Click the **Reload** button for your extension.
3. Refresh any affected web pages to see updates.

### 7. Unload or Remove
- To temporarily disable: toggle the extension off.
- To completely remove: click **Remove**.

---

💡 **Tips**
- Always use a separate folder for testing your unpacked extension to avoid conflicts with the published version.
- Use the Chrome DevTools console to debug your extension scripts.
- If images or resources aren’t loading, make sure paths in `manifest.json` match your folder structure.
