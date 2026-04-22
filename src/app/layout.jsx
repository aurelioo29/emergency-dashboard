import { Montserrat } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata = {
  title: "Alerta - Emergency Dashboard",
  description:
    "Alerta - Emergency Dashboard for monitoring and managing emergency situations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AntdRegistry>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
