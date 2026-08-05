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
      <div className="border-l-[3px] border-l-primary p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">{icon}</div>
          {change !== undefined && (
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                isDecreasing ? 'text-red' : 'text-green'
              }`}
            >
              {Math.abs(change)}%
              {isDecreasing ? <ArrowDownIcon /> : <ArrowUpIcon />}
            </span>
          )}
        </div>

        <div className="mt-6">
          <dt className="text-heading-6 font-bold text-dark">
            {value}
          </dt>
          <dd className="text-sm font-medium text-dark-6">{title}</dd>
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
