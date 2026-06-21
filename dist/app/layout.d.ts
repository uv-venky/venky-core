import type { Metadata } from 'next';
import './globals.css';
export declare function generateMetadata(): Promise<Metadata>;
export default function RootLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>): Promise<import("react/jsx-runtime").JSX.Element>;
export declare const runtime = "nodejs";
export declare const dynamic = "force-dynamic";
export declare const revalidate = 0;
//# sourceMappingURL=layout.d.ts.map