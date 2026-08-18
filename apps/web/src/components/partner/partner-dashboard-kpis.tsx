import Link from 'next/link';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
}

export function KpiCard({ title, value, icon, href }: KpiCardProps) {
  const content = (
    <div className="border border-stroke bg-white shadow-1">
      <div className="border-l-[3px] border-l-primary p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">{icon}</div>
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
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
