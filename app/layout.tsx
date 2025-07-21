// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Importa tus componentes Navbar y Footer
import Navbar from '../components/Navbar'; // Asegúrate de que esta ruta sea correcta
import Footer from '../components/Footer'; // Asegúrate de que esta ruta sea correcta

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mi App KODIGO", // Puedes cambiar el título aquí
  description: "Mini aplicación con Next.js y Firebase para KODIGO", // Y la descripción
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es"> {/* Cambiado a 'es' para español */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, padding: 0 }} // Asegurarse de que no haya margen/padding extra en el body
      >
        {/* Contenedor flex para empujar el footer al final */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar /> {/* Tu barra de navegación */}
          <main style={{ flexGrow: 1 }}> {/* El contenido de tus páginas */}
            {children}
          </main>
          <Footer /> {/* Tu pie de página */}
        </div>
      </body>
    </html>
  );
}