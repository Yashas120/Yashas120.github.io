import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

// Set the theme class before paint to avoid a flash of the wrong theme.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)){document.documentElement.classList.add('light');}}catch(e){}})();`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yashas Kadambi — six interfaces",
  description:
    "One engineer, six interfaces: distributed systems, operating systems, web dev, optical dataplane, backend platform, and teaching — pick how you want to read the resume.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // themeInit adds `light` to <html> before hydration, so the class attribute
    // legitimately differs from the server's markup.
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="font-sans antialiased">
        {children}
        <ThemeToggle />
        <ThemeSwitcher />
      </body>
    </html>
  );
}
