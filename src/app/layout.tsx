import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inkloom Brand Sentinel | AI Brand Governance & Claim Verification",
  description: "Enterprise Brand Governance & Multi-Modal Claim Verification Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}

