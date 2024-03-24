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
    document.querySelector(`#${providerId} button.submit-btn`)
        .addEventListener('click', async (e) => {
            e.preventDefault();
            e.target.disabled = 'disabled'
            const form = document.getElementById(providerId)
            const formData = new FormData(form)
            const obj = Object.fromEntries(formData);
            const footer = document.querySelector(`#footer`);
            footer.replaceChildren();
            footer.textContent = `Скачиваем ${providerId} ...`
            const result = await func(providerId, obj);
            if (result.error) {
                footer.textContent = `Ошибка: ${result.error}`
            } else {
                var ol = document.createElement("ol");
                footer.replaceChildren();
                footer.textContent = 'Скачано'
                footer.appendChild(ol)
                const listElements = result.fileList.map(path => {
                    var listItem = document.createElement("li");
                    var link = document.createElement("a");
                    link.href = `file://${path}`;
                    link.onclick = (e) => {
                        e.preventDefault();
                        console.info(e.target.textContent)
                        return window.electron.openFile(e.target.textContent);
                    }
                    link.textContent = path
                    listItem.append(link);
                    return listItem
                })
                ol.append(...listElements)
            }
            e.target.disabled = false
        })
    document.querySelector(`#${providerId} button.file-path-btn`)
        .addEventListener('click', async (e) => {
            e.preventDefault()
            const filePathInput = document.querySelector(`#${providerId} input[name='filePath']`);
            const result = await window.electron.saveFileDialog(filePathInput.value)
            if (!result.canceled && result.filePath) {
                filePathInput.value = result.filePath
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

