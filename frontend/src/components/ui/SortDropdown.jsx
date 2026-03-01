import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownWideNarrow, Check, ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Latest', description: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest', description: 'Oldest first' },
  { value: 'views:desc', label: 'Most Viewed', description: 'By popularity' },
];

export default function SortDropdown({ value, onChange, options = SORT_OPTIONS }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => o.value === value) || options[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
          open
            ? 'border-accent-500/50 bg-accent-500/10 text-accent-400'
            : 'border-dark-700 bg-dark-900 text-dark-200 hover:border-dark-600 hover:text-dark-100'
        }`}
      >
        <ArrowDownWideNarrow className="h-4 w-4" />
        <span>{selected.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="absolute left-0 z-50 mt-2 min-w-45 origin-top-left overflow-hidden rounded-xl border border-dark-700 bg-dark-900/95 p-1.5 shadow-xl shadow-black/30 backdrop-blur-xl"
          >
            {options.map((option, i) => {
              const isActive = option.value === value;
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.15 }}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-accent-500/15 text-accent-400'
                      : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    {option.description && (
                      <p className={`text-xs mt-0.5 ${isActive ? 'text-accent-400/60' : 'text-dark-500'}`}>
                        {option.description}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
