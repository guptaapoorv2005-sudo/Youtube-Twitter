import { motion } from 'framer-motion';

export const Loader = ({ fullScreen = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center justify-center ${fullScreen ? 'fixed inset-0 z-50' : 'h-32'} ${
        fullScreen ? 'bg-black/50' : ''
      }`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full"
      />
    </motion.div>
  );
};

export const Skeleton = ({ className = '' }) => (
  <motion.div
    animate={{ opacity: [0.6, 1, 0.6] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className={`bg-slate-700 rounded ${className}`}
  />
);
