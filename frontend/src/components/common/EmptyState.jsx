import { motion } from 'framer-motion';

export const EmptyState = ({ title, description, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 text-center"
  >
    {Icon && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4 text-slate-400"
      >
        <Icon size={48} />
      </motion.div>
    )}
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 max-w-sm">{description}</p>
  </motion.div>
);

export const ErrorState = ({ title, description, onRetry, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 text-center bg-red-500/5 border border-red-500/20 rounded-lg p-6"
  >
    {Icon && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4 text-red-500"
      >
        <Icon size={48} />
      </motion.div>
    )}
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 max-w-sm mb-6">{description}</p>
    {onRetry && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={onRetry}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Try Again
      </motion.button>
    )}
  </motion.div>
);
