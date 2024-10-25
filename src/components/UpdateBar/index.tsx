import { useCallback, useEffect, useState } from 'react'
import './UpdateBar.css'

const UpdateBar = ({ appNewVersion, updateProgressMessage }: any) => {
  const [isDownloadingStart, setIsDownloadingStart] = useState<boolean>(false)

  const onUpdateError = useCallback(
    (_event: Electron.IpcRendererEvent, args: any) => {
      setIsDownloadingStart(false)
    },
    []
  )

  useEffect(() => {
    window.ipcRenderer.on('update-error', onUpdateError)

    return () => {
      window.ipcRenderer.off('update-error', onUpdateError)
    }
  }, [])

  return (
    <div className="update-bar">
      {isDownloadingStart ? (
        updateProgressMessage
      ) : (
        <>
          A new version v{appNewVersion} is available, do you want to update it?{' '}
          <button
            onClick={() => {
              setIsDownloadingStart(true)
              window.ipcRenderer.invoke('start-downloading')
            }}
          >
            Update Now
          </button>
        </>
      )}
    </div>
  )
}

export default UpdateBar
