// components/Footer.tsx
export default function Footer() {
  const footerStyle = {
    backgroundColor: '#222',
    color: 'white',
    textAlign: 'center',
    padding: '20px',
    marginTop: 'auto', // Esto ayuda a empujar el footer al final de la página si el contenido es corto
    width: '100%',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.2)',
    fontSize: '0.9em',
  };

  const year = new Date().getFullYear();

  return (
    <footer style={footerStyle}>
      <p>&copy; {year} Ingrid/Issa. Todos los derechos reservados.</p>
      <p>Desarrollado con Next.js y Firebase.</p>
    </footer>
  );
}