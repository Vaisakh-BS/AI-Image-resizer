import React from 'react';

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, children }) => {
  return (
    <div>
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                ${tab.disabled ? 'cursor-not-allowed text-gray-600' : 'text-gray-300 hover:text-white'}
                ${activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent'}
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-5">
        {React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return null;
            return tabs[index].id === activeTab ? child : null;
        })}
      </div>
    </div>
  );
};

export default Tabs;
