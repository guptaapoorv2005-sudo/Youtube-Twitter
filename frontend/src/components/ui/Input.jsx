import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-dark-200">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-xl border border-dark-700 bg-dark-800 px-4 py-2.5 text-sm text-dark-100 placeholder-dark-500 outline-none transition-all focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
