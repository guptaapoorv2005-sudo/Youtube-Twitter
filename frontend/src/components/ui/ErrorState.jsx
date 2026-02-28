import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 rounded-2xl bg-red-500/10 p-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
      </div>
      <h3 className="mb-1 text-lg font-medium text-dark-200">Oops!</h3>
      <p className="mb-4 max-w-sm text-sm text-dark-400">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </motion.div>
  );
}
