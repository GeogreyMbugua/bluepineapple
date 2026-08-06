import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import LenisScroll from '@/components/marketing/lenis-scroll';

interface MarketingShellProps {
  readonly variant: 'parent' | 'coastal' | 'real-estate';
  readonly children: React.ReactNode;
}

export function MarketingShell({ variant, children }: MarketingShellProps) {
  return (
    <div className="bg-muted min-h-screen">
      <LenisScroll />
      {variant !== 'parent' && <Navbar variant={variant} />}
      {children}
      <Footer />
    </div>
  );
}