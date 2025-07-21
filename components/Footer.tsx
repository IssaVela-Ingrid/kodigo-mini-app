// components/Footer.tsx
import React from 'react'; // Asegúrate de importar React si no lo estás haciendo ya

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-kodigo-dark text-kodigo-text-light text-center p-5 shadow-lg border-t border-kodigo-primary-green text-sm">
      <p className="my-1">&copy; {year} Ingrid/Issa. Todos los derechos reservados.</p>
      <p className="my-1">Desarrollado con Next.js y Firebase.</p>
      <p className="my-1 text-kodigo-secondary-green">Estilo KODIGO Music</p>
    </footer>
  );
}