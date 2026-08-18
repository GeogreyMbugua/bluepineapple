import { ArrowDownIcon, ArrowUpIcon } from '@/components/admin/icons';

type KPICardProps = {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  href?: string;
};

export function KPICard({ title, value, change, icon, href }: KPICardProps) {
  const isDecreasing = change !== undefined && change < 0;

  const content = (
    <div className="border border-stroke bg-white shadow-1">
      <div className="border-l-[3px] border-l-primary p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">{icon}</div>
          {change !== undefined && (
            <span
              className={`flex items-center gap-1 text-xs font-medium sm:text-sm ${
                isDecreasing ? 'text-red' : 'text-green'
              }`}
            >
              {Math.abs(change)}%
              {isDecreasing ? <ArrowDownIcon className="size-3 sm:size-4" /> : <ArrowUpIcon className="size-3 sm:size-4" />}
            </span>
          )}
        </div>

        <div className="mt-3 sm:mt-6">
          <dt className="text-xl font-bold text-dark sm:text-heading-6">
            {value}
          </dt>
          <dd className="text-xs font-medium text-dark-6 sm:text-sm">{title}</dd>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}
