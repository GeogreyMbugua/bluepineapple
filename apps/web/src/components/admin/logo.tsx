import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="/brand/logo.png"
      alt="Blue Pineapple"
      width={120}
      height={40}
      className="h-10 w-auto"
    />
  );
}
