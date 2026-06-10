import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Internship Final Stage | Adhoc Network Tech",
  description: "End-to-end portal for MEAN/MERN Stack internship final projects. Managed by Adhoc Network Tech.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--color-background)] text-[var(--color-foreground)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
