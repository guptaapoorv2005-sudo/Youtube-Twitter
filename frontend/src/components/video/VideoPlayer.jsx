import { motion } from 'framer-motion';
import { Play, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useState, useRef } from 'react';

export const VideoPlayer = ({ videoUrl, poster, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        className="w-full h-auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Player controls */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-between p-4 opacity-0 transition-opacity"
      >
        {/* Top */}
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
        </div>

        {/* Center */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={togglePlay}
            className="w-16 h-16 bg-blue-600/80 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
          >
            <Play size={32} className="fill-white text-white ml-1" />
          </motion.button>
        </div>

        {/* Bottom */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={togglePlay}
            className="p-2 rounded hover:bg-white/20 transition-colors"
          >
            <Play size={20} className="fill-white text-white ml-0.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={toggleMute}
            className="p-2 rounded hover:bg-white/20 transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </motion.button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-white/30 rounded cursor-pointer"
          />

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={toggleFullscreen}
            className="ml-auto p-2 rounded hover:bg-white/20 transition-colors"
          >
            <Maximize size={20} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
