import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 rounded-2xl bg-dark-800 p-4">
        <Icon className="h-10 w-10 text-dark-500" />
      </div>
      <h3 className="mb-1 text-lg font-medium text-dark-200">{title}</h3>
      {description && <p className="max-w-sm text-sm text-dark-400">{description}</p>}
    </motion.div>
  );
}
