import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
}

const Select: React.FC<SelectProps> = ({ label, options, ...props }) => {
  return (
    <div className="flex flex-col w-full">
      <label htmlFor={props.id || label} className="mb-1 text-sm font-medium text-gray-400">
        {label}
      </label>
      <select
        id={props.id || label}
        className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
