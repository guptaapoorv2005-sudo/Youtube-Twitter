export default function Avatar({ src, alt, size = 'md', className = '' }) {
  const sizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
    '2xl': 'h-24 w-24',
  };

  return (
    <div className={`${sizes[size]} shrink-0 overflow-hidden rounded-full ring-2 ring-dark-700 ${className}`}>
      {src ? (
        <img src={src} alt={alt || ''} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-accent-500 to-brand-500 text-xs font-bold text-white">
          {alt?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
}
