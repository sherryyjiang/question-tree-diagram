import { cn } from '@/lib/utils';

interface TreeConnectorProps {
  className?: string;
}

export function TreeConnector({ className }: TreeConnectorProps) {
  return (
    <div className={cn('flex justify-center py-2', className)}>
      <div className="w-0.5 h-4 bg-border/50" />
      <div className="absolute -bottom-1 w-2 h-2 border-l-2 border-b-2 border-border/50 rotate-[-45deg]" />
    </div>
  );
}

interface TreeBranchProps {
  count: number;
  className?: string;
}

export function TreeBranch({ count, className }: TreeBranchProps) {
  if (count === 0) return null;

  return (
    <div className={cn('flex justify-center py-2', className)}>
      <div className="relative flex items-end">
        {/* Vertical stem */}
        <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-4 bg-border/50" />
        
        {/* Horizontal connector */}
        {count > 1 && (
          <div
            className="absolute top-4 h-0.5 bg-border/50"
            style={{
              left: `calc(${100 / count / 2}% - 1px)`,
              right: `calc(${100 / count / 2}% - 1px)`,
            }}
          />
        )}
      </div>
    </div>
  );
}

