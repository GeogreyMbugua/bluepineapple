import { MarketingShell } from '@/components/marketing/marketing-shell';

export default function CoastalLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <MarketingShell variant="coastal">
      {children}
    </MarketingShell>
  );
}