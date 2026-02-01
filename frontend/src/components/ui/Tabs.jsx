import { motion } from 'framer-motion';
import { useState } from 'react';

export const Tabs = ({ tabs, defaultTab = 0, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-700">
        {tabs.map((tab, index) => (
          <motion.button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === index ? 'text-blue-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
            {activeTab === index && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
              />
            )}
          </motion.button>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        key={activeTab}
        className="mt-4"
      >
        {tabs[activeTab].content}
      </motion.div>
    </div>
  );
};
