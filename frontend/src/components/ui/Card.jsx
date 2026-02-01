import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hoverable = false }) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2 } : {}}
      className={`bg-slate-800 rounded-lg border border-slate-700 overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-4 py-3 border-b border-slate-700 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`px-4 py-3 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-4 py-3 border-t border-slate-700 flex gap-2 ${className}`}>{children}</div>
);
