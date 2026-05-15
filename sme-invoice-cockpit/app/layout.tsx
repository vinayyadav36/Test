import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { PwaRegister } from "./components/PwaRegister";

export const metadata: Metadata = {
  title: "Invoice Cockpit",
  description: "Zero-DB SME invoicing platform for Indian businesses",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <AuthProvider>
          {children}
          <PwaRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
