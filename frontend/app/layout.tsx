import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { NotificationProvider } from "@/context/NotificationContext"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Toaster } from "react-hot-toast"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "DLT TalentHub - Connecting African DLT Talent with Global Opportunities",
  description: "The premier talent marketplace for Distributed Ledger Technology opportunities in Africa",
  keywords: ["DLT", "blockchain", "talent", "jobs", "Africa", "cryptocurrency", "web3"],
  authors: [{ name: "DLT TalentHub" }],
  openGraph: {
    title: "DLT TalentHub - Connecting African DLT Talent with Global Opportunities",
    description: "The premier talent marketplace for Distributed Ledger Technology opportunities in Africa",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DLT TalentHub",
    description: "The premier talent marketplace for Distributed Ledger Technology opportunities in Africa",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'art redox',
    icons: {
      icon: '/favicon.ico',
    },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-primary bg-bg text-primary">
        <ErrorBoundary>
          <AuthProvider>
            <NotificationProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#1D2039",
                    color: "#fff",
                  },
                  success: {
                    style: {
                      background: "#33d37d",
                      color: "#1D2039",
                    },
                  },
                  error: {
                    style: {
                      background: "#f04545",
                      color: "#fff",
                    },
                  },
                }}
              />
            </NotificationProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
