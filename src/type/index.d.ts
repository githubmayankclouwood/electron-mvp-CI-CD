interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: Option[];
  label?: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  value: string | number;
  name?: string;
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

interface SelectChromeModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  activeChromePorts: number[],
  onSave: (val) => void,
}

interface Language {
  en: string;
  de: string;
}
