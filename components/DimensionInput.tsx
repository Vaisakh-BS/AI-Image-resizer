
import React from 'react';

interface DimensionInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const DimensionInput: React.FC<DimensionInputProps> = ({ label, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onChange(numValue);
    } else if (e.target.value === '') {
        onChange(0);
    }
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={label} className="mb-1 text-sm font-medium text-gray-400">
        {label}
      </label>
      <input
        id={label}
        type="number"
        value={value === 0 ? '' : value}
        onChange={handleChange}
        min="1"
        className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        placeholder={label}
      />
    </div>
  );
};

export default DimensionInput;
