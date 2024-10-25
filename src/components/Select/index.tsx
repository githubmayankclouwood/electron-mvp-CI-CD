import React from 'react'

const Select: React.FC<SelectProps> = ({
  options,
  label,
  onChange,
  value,
  name,
}) => {
  return (
    <div className='mb-4 flex relative w-full align-middle items-center'>
      {label && (
        <label className='min-w-20 block text-sm font-medium text-gray-700 mr-2'>
          {' '}
          {label}{' '}
        </label>
      )}

      <select
        className='block p-2 flex-grow focus:outline-none focus:border-indigo-500 text-gray-500 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm'
        onChange={onChange}
        value={value}
        name={name}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select
