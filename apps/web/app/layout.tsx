import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Nexaris Travel AI', description: 'AI-powered travel booking platform for flights, itineraries, payments, and dashboards.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
