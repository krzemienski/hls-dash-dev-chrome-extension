// src/components/common/Skeleton.tsx

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height = variant === 'text' ? '1em' : undefined
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

export function SkeletonVariantCard() {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton width="120px" height="24px" />
          <Skeleton width="180px" height="16px" />
          <Skeleton width="200px" height="14px" />
        </div>
        <Skeleton variant="rectangular" width="60px" height="24px" />
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <Skeleton width="200px" height="28px" className="mb-4" />

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-gray-50">
            <Skeleton width="80px" height="12px" className="mb-2" />
            <Skeleton width="100px" height="32px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonMetadata() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <Skeleton width="150px" height="24px" className="mb-4" />

      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i}>
            <Skeleton width="100px" height="14px" className="mb-2" />
            <Skeleton width="140px" height="18px" />
          </div>
        ))}
      </div>
    </div>
  );
}
