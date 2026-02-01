import { motion } from 'framer-motion';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Image, Video as VideoIcon } from 'lucide-react';
import { useState } from 'react';

export const CreatePostCard = ({ user, onSubmit, isLoading }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (content.trim()) {
      await onSubmit(content);
      setContent('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="mb-4">
        <CardBody className="p-4">
          <div className="flex gap-4">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt={user?.username}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?!"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                rows={3}
              />

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                  >
                    <Image size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                  >
                    <VideoIcon size={18} />
                  </motion.button>
                </div>
                <Button onClick={handleSubmit} disabled={!content.trim() || isLoading}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
