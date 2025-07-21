// components/Navbar.tsx
'use client'; // Necesario para usar Link de next/link si quieres que sea un Client Component

import Link from 'next/link';

export default function Navbar() {
  const navStyle = {
    backgroundColor: '#333',
    padding: '15px 20px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  };

  const linkContainerStyle = {
    display: 'flex',
    gap: '25px',
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.1em',
    fontWeight: 'bold',
    transition: 'color 0.3s ease',
  };

  const hoverLinkStyle = { // Esto no es JS puro, es un concepto, lo ideal es CSS
    // color: '#007bff', // Simplemente ilustrativo, esto se haría con CSS
  };

  return (
    <nav style={navStyle}>
      <Link href="/" style={{ ...linkStyle, fontSize: '1.4em' }}>
        Mi App KODIGO
      </Link>
      <div style={linkContainerStyle}>
        <Link href="/" style={linkStyle}>
          Tareas
        </Link>
        <Link href="/appointments" style={linkStyle}>
          Citas Médicas
        </Link>
        <Link href="/chat" style={linkStyle}>
          Chat
        </Link>
      </div>
    </nav>
  );
}