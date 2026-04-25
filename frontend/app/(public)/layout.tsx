import LenisProvider from "@/components/landing/LenisProvider";
import PublicNav from "@/components/landing/PublicNav";
import PublicFooter from "@/components/landing/PublicFooter";
import ChatWidget from "@/components/landing/ChatWidget";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <div className="min-h-screen bg-[#0A0A0F] text-[#F0F0FF] overflow-x-hidden">
        <PublicNav />
        <main>{children}</main>
        <PublicFooter />
        <ChatWidget />
      </div>
    </LenisProvider>
  );
}
