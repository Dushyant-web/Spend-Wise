import Link from "next/link";
import { Zap, Twitter, Github, Instagram, Linkedin } from "lucide-react";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Roadmap", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "About", href: "/blog" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Sign up", href: "/register" },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#0A0A0F] mt-20">
      <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-[#6C63FF]/40 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#6C63FF] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-lg text-white">SpendWise AI</span>
            </Link>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Your money, finally intelligent. Built for Indian college students who want to spend smarter.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { I: Twitter, label: "Twitter" },
                { I: Github, label: "GitHub" },
                { I: Instagram, label: "Instagram" },
                { I: Linkedin, label: "LinkedIn" },
              ].map(({ I, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <I className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-white text-sm font-semibold mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-gray-500 hover:text-white text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} SpendWise AI. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs">
            Made with care for Indian college students.
          </p>
        </div>
      </div>
    </footer>
  );
}
