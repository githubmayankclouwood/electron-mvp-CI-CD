import React, { ReactNode } from 'react'

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-lg mx-2'>
            <div className='flex justify-between items-center p-4 border-b'>
              <h2 className='text-lg text-gray-600 font-medium'>{title}</h2>
              <button
                onClick={onClose}
                className='text-gray-500 hover:text-gray-700 focus:outline-none'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  ></path>
                </svg>
              </button>
            </div>
            <div className='p-4'>{children}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default Modal
