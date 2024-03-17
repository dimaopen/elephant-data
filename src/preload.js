// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const {contextBridge, ipcRenderer} = require('electron/renderer')

contextBridge.exposeInMainWorld(
    'electron',
    {
        getProviderSettings: () => {
            return ipcRenderer.invoke('get-provider-settings')
        },
        fetchProvider: (provider, formData) => {
            ipcRenderer.invoke('fetch-provider', provider, formData)
        },
    }
)