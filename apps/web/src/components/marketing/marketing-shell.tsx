import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import LenisScroll from '@/components/marketing/lenis-scroll';

interface MarketingShellProps {
  readonly variant: 'parent' | 'coastal' | 'real-estate';
  readonly children: React.ReactNode;
}

export function MarketingShell({ variant, children }: MarketingShellProps) {
  return (
    <div className="bg-cyan-100 min-h-screen">
      <LenisScroll />
      <Navbar variant={variant} />
      {children}
      <Footer />
    </div>
  );
}