/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import './index.css';

function attachProviderToForm(providerId, func) {
    document.querySelector(`#${providerId} input[type="submit"]`)
        .addEventListener('click', (e) => {
            e.preventDefault();
            const form = document.getElementById(providerId)
            const formData = new FormData(form)
            const obj = Object.fromEntries(formData);
            func(providerId, obj);
        })
    document.querySelector(`#${providerId} button.file-path-btn`)
        .addEventListener('click', async (e) => {
            // e.preventDefault();
            const result = await window.electron.saveFileDialog()
            if (result.filePaths[0]) {
                document.querySelector(`#${providerId} input[name='filePath']`).value = result.filePaths[0]
            }
        })
}

// We attach all our forms to provider fetch methods
attachProviderToForm('merlion', window.electron.fetchProvider)

// Get all the provider settings (credentials mainly) and set the values to our forms
const providerSettings = await window.electron.getProviderSettings()
const providers = Object.entries(providerSettings)
for (const [provider, data] of providers) {
    const form = document.getElementById(provider)
    for (const [key, val] of Object.entries(data)) {
        const input = form.elements[key];
        switch (input.type) {
            case 'checkbox':
                input.checked = !!val;
                break;
            default:
                input.value = val;
                break;
        }
    }
}

