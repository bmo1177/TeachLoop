import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://teach-loop-ten.vercel.app"),
  title: {
    default: "TeachLoop — Communication Coaching for Technical Professionals",
    template: "%s | TeachLoop",
  },
  description:
    "Train how you communicate, not just what you know. AI-powered communication coaching for technical professionals.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "TeachLoop — Communication Coaching for Technical Professionals",
    description:
      "Train how you communicate, not just what you know. Practice technical concepts and system design with AI coaching.",
    url: "https://teach-loop-ten.vercel.app",
    siteName: "TeachLoop",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeachLoop — Communication Coaching for Technical Professionals",
    description:
      "Train how you communicate, not just what you know. AI-powered communication coaching for technical professionals.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TeachLoop",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#C2410C",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('teachloop-theme');if(t){document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name="color-scheme"]');if(m)m.content=t==='chalkboard'?'dark':'light'}}catch(e){}})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
