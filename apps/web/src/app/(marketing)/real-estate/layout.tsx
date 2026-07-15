import { MarketingShell } from '@/components/marketing/marketing-shell';

export default function RealEstateLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="theme-real-estate">
      <MarketingShell variant="real-estate">
        {children}
      </MarketingShell>
    </div>
  );
}