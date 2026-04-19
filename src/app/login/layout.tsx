import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş — Nurevşan Yönetim Paneli",
  description: "AI destekli kişisel yönetim asistanına giriş yapın",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
