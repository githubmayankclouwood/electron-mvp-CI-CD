import { useCallback, useEffect, useState } from 'react'
import appIcon from '../build/icon.png'
import './App.css'
import FileList from './components/FilesList'
import Select from './components/Select'
import SelectChrome from './components/Modals/SelectChrome'
import ChangeLocale from './components/Locale'
import { useTranslation } from 'react-i18next'
import UpdateBar from './components/UpdateBar'

function App() {
  const { t } = useTranslation()

  const [passwordManager, setPasswordManager] = useState<string>('None')
  const [activeChromePorts, setActiveChromePorts] = useState<number[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [gotoType, setGotoType] = useState<string>('link')
  const [appNewVersion, setAppNewVersion] = useState<string>('')
  const [updateProgressMessage, setUpdateProgressMessage] = useState<
    string | null
  >(null)

  const launchChrome = async () => {
    const dFiles = await window.ipcRenderer.invoke(
      'launch-chrome',
      passwordManager
    )
    console.log('dFiles', dFiles)
    setFiles(dFiles || [])
  }

  const getRunningChromePorts = async (type: string) => {
    setGotoType(type)
    const ports: number[] = await window.ipcRenderer.invoke(
      'get-running-chrome-ports'
    )
    if (!ports.length) {
      alert(t('alert.launchChrome'))
      return
    }
    setActiveChromePorts(ports)
  }

  const goToChrome = async (chromePort: number) => {
    await window.ipcRenderer.invoke(
      'goto-chrome',
      'https://github.com',
      chromePort
    )
  }

  const downloadPdf = async (chromePort: number) => {
    await window.ipcRenderer.invoke('download-pdf', chromePort)
  }

  const onSave = (chromePort: number) => {
    setActiveChromePorts([])
    if (gotoType === 'link') goToChrome(chromePort)
    else downloadPdf(chromePort)
  }

  const getBookmarks = async () => {
    try {
      const fetchedBookmarks = await window.ipcRenderer.invoke('get-bookmarks')
      console.log('fetchedBookmarks', fetchedBookmarks)
      setBookmarks(
        fetchedBookmarks?.length ? ([fetchedBookmarks[0]] as any) : []
      )
    } catch (error) {
      alert(t('alert.chromeNotFound'))
    }
  }

  const onUpdateAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, args: any) => {
      if (args?.newVersion) setAppNewVersion(args?.newVersion)
      setUpdateProgressMessage(args.message)
    },
    []
  )

  useEffect(() => {
    window.ipcRenderer.invoke('checking-update')
    window.ipcRenderer.on('update-available', onUpdateAvailable)

    return () => {
      window.ipcRenderer.off('update-available', onUpdateAvailable)
    }
  }, [])

  return (
    <div className="App">
      {updateProgressMessage && (
        <UpdateBar
          appNewVersion={appNewVersion}
          updateProgressMessage={updateProgressMessage}
        />
      )}

      <div className="flex justify-end">
        <ChangeLocale />
      </div>

      <div className="logo-box">
        <a href="https://www.getmyinvoices.com/de/" target="_blank">
          <img src={appIcon} className="logo bg-black" alt={t('app.title')} />
        </a>
      </div>
      <h1>{t('app.title')}</h1>
      <div className="p-4">
        <Select
          label={t('passwordManager.label')}
          options={[
            { label: t('passwordManager.none'), value: 'None' },
            { label: t('passwordManager.1Password'), value: '1Password' },
            { label: t('passwordManager.dashlane'), value: 'Dashlane' },
            { label: t('passwordManager.lastPass'), value: 'LastPass' },
            { label: t('passwordManager.nordPass'), value: 'NordPass' },
            { label: t('passwordManager.bitwarden'), value: 'Bitwarden' },
          ]}
          onChange={(e) => setPasswordManager(e.target.value)}
          value={passwordManager}
        />
      </div>
      <SelectChrome
        title={t('selectChrome.title')}
        isOpen={activeChromePorts.length > 0}
        onClose={() => setActiveChromePorts([])}
        activeChromePorts={activeChromePorts}
        onSave={onSave}
      />
      <div className="card">
        <button className="bg-black text-white" onClick={launchChrome}>
          {t('btn.start')}
        </button>
        <button
          className="ml-2 bg-black text-white"
          onClick={() => getRunningChromePorts('link')}
        >
          {t('btn.goTo')}
        </button>
        <button className="ml-2 bg-black text-white" onClick={getBookmarks}>
          {t('btn.bookmarks')}
        </button>
        <button
          className="ml-2 bg-black text-white"
          onClick={() => getRunningChromePorts('pdf')}
        >
          {t('btn.downloadPdf')}
        </button>
      </div>

      {files.length > 0 && <FileList files={files} />}
      {bookmarks.length > 0 && <FileList files={bookmarks} />}
    </div>
  )
}

export default App
