import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { ToastProvider } from "@/contexts/toast-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeakGuard — Threat Intelligence",
  description: "Plataforma OSINT de verificación de filtraciones",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        <ToastProvider>
          <AuthProvider>
            <NotificationsProvider>{children}</NotificationsProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
