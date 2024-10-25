import React, { useState } from 'react'
import Modal from '.'
import Select from '../Select'
import { useTranslation } from 'react-i18next'

interface SelectChromeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (selectedPort: number) => void
  title: string
  activeChromePorts: number[]
}

const SelectChrome: React.FC<SelectChromeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  activeChromePorts,
}) => {
  const { t } = useTranslation()
  const [value, setValue] = useState<number>(0)

  return (
    <>
      <Modal title={title} isOpen={isOpen} onClose={onClose}>
        <div className='p-4 border-t'>
          <Select
            label={t('selectChrome.label')}
            options={activeChromePorts.map((val: number, i: number) => ({
              label: `${t('selectChrome.option')} ${i + 1}`,
              value: val,
            }))}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          <div className='flex gap-1 justify-end'>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-black text-white rounded focus:outline-none'
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => onSave(value || activeChromePorts[0])}
              className='px-4 py-2 bg-black text-white rounded focus:outline-none'
            >
              {t('common.select')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default SelectChrome
