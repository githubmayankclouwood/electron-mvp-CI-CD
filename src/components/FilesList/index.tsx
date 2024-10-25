import React from 'react'
import { useTranslation } from 'react-i18next'

interface FileListProps {
  files: string[]
}

const FileList: React.FC<FileListProps> = ({ files }) => {
  const { t } = useTranslation()

  return (
    <div className='max-w-md mx-auto rounded-lg shadow-md p-4'>
      <h2 className='text-xl font-bold mb-4'>{t('files.inDirectory')}</h2>
      <ol className='divide-y divide-gray-200'>
        {files.map((file, index) => (
          <li key={index} className='py-2'>
            {file}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default FileList
