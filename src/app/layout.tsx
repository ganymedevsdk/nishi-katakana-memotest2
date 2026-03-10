import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katakana Memotest | Nishi Nihongo Gakko",
  description: "Practica Katakana con este juego de memoria - 西日本語学校 Nishi Nihongo Gakko",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* [ukiyo-e] Preconnect for Google Fonts performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased washi-bg">
        {/* [ukiyo-e] Decorative pine branch — matching moodboard top-right element */}
        <svg
          className="decorative-branch"
          viewBox="0 0 220 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Main branch */}
          <path d="M220 5 C200 15, 180 20, 150 30 C130 38, 110 42, 85 50 C70 55, 50 62, 35 72" stroke="#1A1008" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          {/* Secondary branch */}
          <path d="M150 30 C145 45, 138 55, 125 70" stroke="#1A1008" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M110 42 C108 52, 102 60, 95 68" stroke="#1A1008" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          {/* Pine needle clusters */}
          <g opacity="0.7" fill="#4A6741">
            <ellipse cx="85" cy="48" rx="18" ry="8" transform="rotate(-15 85 48)"/>
            <ellipse cx="120" cy="35" rx="15" ry="7" transform="rotate(-10 120 35)"/>
            <ellipse cx="55" cy="62" rx="16" ry="7" transform="rotate(-20 55 62)"/>
            <ellipse cx="145" cy="28" rx="12" ry="6" transform="rotate(-5 145 28)"/>
            <ellipse cx="100" cy="55" rx="14" ry="6" transform="rotate(-18 100 55)"/>
            <ellipse cx="130" cy="65" rx="12" ry="5" transform="rotate(-12 130 65)"/>
          </g>
        </svg>
        {children}
      </body>
    </html>
  );
}
