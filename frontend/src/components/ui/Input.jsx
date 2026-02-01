export const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  label,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${className} ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && <span className="block text-red-400 text-sm mt-1">{error}</span>}
    </div>
  );
};

export const TextArea = ({
  placeholder,
  value,
  onChange,
  error,
  label,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none ${className} ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && <span className="block text-red-400 text-sm mt-1">{error}</span>}
    </div>
  );
};
