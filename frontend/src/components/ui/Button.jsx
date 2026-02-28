import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent-500 text-white hover:bg-accent-600 shadow-lg shadow-accent-500/20',
    secondary: 'bg-dark-800 text-dark-100 hover:bg-dark-700 border border-dark-700',
    ghost: 'text-dark-300 hover:bg-dark-800 hover:text-dark-100',
    danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
    brand: 'bg-linear-to-r from-accent-500 to-brand-500 text-white shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </motion.button>
  );
}
