import { SupportedLangs } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import Select from '../Select'

function ChangeLocale() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: keyof Language) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('lang', lng) // Save the selected language
  }

  return (
    <div className='max-w-2'>
      <Select
        options={Object.keys(SupportedLangs).map((lang) => ({
          label: SupportedLangs[lang as keyof Language],
          value: lang,
        }))}
        onChange={(e) => changeLanguage(e.target.value as keyof Language)}
        value={i18n.language}
      />
    </div>
  )
}

export default ChangeLocale
