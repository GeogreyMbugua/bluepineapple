import type { SVGProps } from 'react';

/** Line-art boat on waves — Experiences panel (mockup). */
export function ExperiencesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      {/* Hull */}
      <path
        d="M16 38h40c.6 0 1 .5.9 1.1C55.8 46.2 48.2 51 36 51s-19.8-4.8-20.9-11.9c-.1-.6.3-1.1.9-1.1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Cabin */}
      <path
        d="M24 38V24.5c0-.7.5-1.2 1.2-1.1l20.5 2.8c.6.1 1 .6 1 1.2V38"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Mast */}
      <path d="M36 26v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* Window */}
      <rect
        x="28"
        y="29"
        width="5"
        height="4.5"
        rx="0.6"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      {/* Waves */}
      <path
        d="M12 56c4.5-2.4 9.5-3.6 14.8-3.6 5.5 0 10.4 1.5 14.7 3.6 4.3-2.1 9.2-3.6 14.7-3.6 4.5 0 8.7.9 12.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14 61c3.8-1.8 8-2.7 12.5-2.7 4.8 0 9.1 1.2 12.8 2.7 3.7-1.5 8-2.7 12.8-2.7 4 0 7.7.7 11.1 2.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Bird */}
      <path
        d="M48 18c1.8-3.2 5-4 7-1.6 1.6 1.9.4 4.6-1.9 5.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="54.2" cy="15.2" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** Line-art beach house + palm — Real Estate panel (mockup). */
export function RealEstateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      {/* Roof */}
      <path
        d="M14 42 32 26l18 16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* House body */}
      <path
        d="M18 40.5V56h28V40.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Door */}
      <path
        d="M28.5 56V46h7v10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Window */}
      <rect
        x="21"
        y="44"
        width="5"
        height="5"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      {/* Palm trunk */}
      <path
        d="M50 56V30"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Palm fronds */}
      <path
        d="M50 32c5.5-1.5 9.5-5.5 10.8-10.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M50 35c-5.8-1.2 10.2-7.2 12-2.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M50 38.5c5 .6 9.5-2.8 11.2-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M50 34c-4.8 1.5-8.5-2.2-9.5-6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Ground */}
      <path
        d="M10 58.5h52"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
