import { StickyBookBar } from "./_components/StickyBookBar";

export default function TripLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <StickyBookBar />
    </>
  );
}
