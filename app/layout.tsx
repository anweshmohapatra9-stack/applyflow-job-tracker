import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ApplyFlow — Job Application Tracker',
  description:
    'A focused dashboard for tracking job applications, interview stages, and follow-ups.',
  openGraph: {
    title: 'ApplyFlow — Job Application Tracker',
    description:
      'Track every application, interview stage, and follow-up in one focused dashboard.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ApplyFlow — Job Application Tracker',
    description:
      'Track every application, interview stage, and follow-up in one focused dashboard.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
