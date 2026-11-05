import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Holis • Avaliação ATM',description:'História de saúde, mapa de dor e preparação para a consulta.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>}
