import { LandingPage } from '@/components/marketing';
import { MarketingShell } from '@/components/marketing/marketing-shell';

export default function Home() {
  return (
    <MarketingShell variant="parent">
      <LandingPage />
    </MarketingShell>
  );
}