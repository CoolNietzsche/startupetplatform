import { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Authentication - StartupET",
  description: "Sign in or create an account on StartupET",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`flex flex-col md:flex-row md:h-[100dvh] md:overflow-hidden ${inter.className}`}>
      {/* Left Branding Section - wider than the form panel, full split from tablet width up */}
      <div className="hidden md:flex w-3/5 flex-col relative overflow-hidden"
        style={{ backgroundImage: `url('/image/pmloginpagephoto.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Gradient overlay: dark bands top/bottom for text legibility, clear in the
            middle so the people in the photo (incl. the PM) stay fully visible/uncovered */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.72) 20%, rgba(0,0,0,0.1) 34%, rgba(0,0,0,0.1) 68%, rgba(0,0,0,0.72) 82%, rgba(0,0,0,0.72) 100%)" }} />

        <div className="relative z-10 flex flex-col h-full px-12 lg:px-16 py-10">
          {/* Small logo mark, top-left */}
          <Link href="/" className="inline-flex items-center w-fit group">
            <img src="/image/WhatsApp_Image_2026-07-18_at_8.29.44_PM-removebg-preview.png" alt="StartupET" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>

          <div className="flex-1" />

          {/* Headline block - moved to the bottom dark band, clear of the people above */}
          <div className="max-w-md mb-6">
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Hello StartupET!
            </h2>
            <p className="text-base text-white/80 font-medium leading-relaxed">
              Sign in to your account or create one to get started. Creating an account does not mean submitting a startup application.
            </p>
          </div>

          {/* Footer - sits in the bottom dark band */}
          <p className="text-xs text-white/50 font-medium">
            © {new Date().getFullYear()} StartupET. All rights reserved.
          </p>
        </div>
      </div>

      {/* Mobile-only banner - stacked above the form instead of hidden entirely */}
      <div className="flex md:hidden w-full h-44 shrink-0 relative overflow-hidden"
        style={{ backgroundImage: `url('/image/pmloginpagephoto.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6 text-center">
          <Link href="/" className="inline-flex items-center">
            <img src="/image/WhatsApp_Image_2026-07-18_at_8.29.44_PM-removebg-preview.png" alt="StartupET" className="h-14 w-auto object-contain mb-2" />
          </Link>
          <p className="text-xs text-white/90 font-medium leading-snug max-w-xs">
            Sign in or create an account to get started.
          </p>
        </div>
      </div>

      {/* Right Content Section */}
      <div className="w-full md:w-2/5 flex-1 bg-white flex flex-col p-6 sm:p-10 lg:p-14 relative overflow-y-auto">

        {/* Global Fixed Back Button */}
        <Link
          href="/"
          className="fixed top-4 left-4 lg:top-8 lg:left-8 flex items-center justify-center text-brand-deep-dark bg-white/80 backdrop-blur-md border border-slate-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] hover:border-brand-startup-amber/30 hover:bg-white hover:text-brand-startup-amber h-10 w-10 rounded-full transition-all hover:scale-105 active:scale-95 z-[100]"
          title="Back to Home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* Wordmark, shared across sign-in/sign-up - hidden on mobile since the stacked banner already shows it */}
        <Link href="/" className="hidden md:inline-flex items-center gap-2 w-fit mb-12 lg:mb-16">
          <img src="/image/WhatsApp_Image_2026-07-18_at_8.29.44_PM-removebg-preview.png" alt="StartupET" className="h-8 w-auto object-contain" />
          <span className="text-xl font-black text-brand-deep-dark tracking-tight">StartupET</span>
        </Link>

        <div className="w-full max-w-md mx-auto md:mx-0 relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
