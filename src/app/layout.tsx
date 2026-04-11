import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solaris Insights — Python Analytics Dashboard",
  description:
    "Sales analytics dashboard with filters, KPIs, and interactive charts. Built with Python + FastAPI + Plotly Dash.",
  openGraph: {
    title: "Solaris Insights — Python Analytics Dashboard",
    description: "Python Dash-style analytics dashboard.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
