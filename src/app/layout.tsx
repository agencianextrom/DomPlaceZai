import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { ProductComparisonBar } from "@/components/product/ProductComparisonBar";
import { NProgressLoader } from "@/components/navigation/NProgressLoader";
import { PostHogInit } from "@/components/analytics/PostHogInit";
import CursorGlow from "@/components/effects/CursorGlow";
import { ConfettiProvider } from "@/components/effects/ConfettiProvider";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { FloatingDealAlert, QuickAddFloatingButton } from "@/components/home/FloatingDealAlert";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DomPlace - Marketplace de Dom Eliseu, PA",
  description: "DomPlace - O marketplace de Dom Eliseu, PA. Encontre produtos, lojas e serviços locais com entrega rápida.",
  keywords: ["DomPlace", "Dom Eliseu", "marketplace", "Pará", "comércio local", "entrega rápida", "produtos locais"],
  authors: [{ name: "DomPlace" }],
  icons: {
    icon: "/domplace-logo.png",
  },
  other: {
    'theme-color': '#059669',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#059669',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" sizes="192x192" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DomPlace" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}
      >
        <NProgressLoader />
        <PostHogInit />
        <ConfettiProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <div className="min-h-screen flex flex-col relative">
              <CursorGlow />
              <ScrollProgress />
              <Header />
              <main className="flex-1 pb-20 md:pb-4" role="main" id="main-content">
                {children}
              </main>
              <BackToTop />
              <ProductComparisonBar />
              <FloatingDealAlert />
              <QuickAddFloatingButton />
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
        </ConfettiProvider>
        <Toaster />
      </body>
    </html>
  );
}
