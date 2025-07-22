// app/chat/page.tsx
'use client'; // Necesario para usar Hooks de React y estado en componentes del lado del cliente

import { useEffect, useState, FormEvent } from 'react';
// Importa las funciones de Firestore necesarias para el chat en tiempo real.
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebaseClient'; // RUTA CORREGIDA: Sube dos niveles (de chat/ a app/, luego a la raíz) y luego entra en lib/

// Interfaz para un mensaje, incluyendo el tipo Timestamp de Firestore.
interface Message {
  id: string;
  text: string;
  user: string; // Para identificar quién envió el mensaje
  createdAt: Timestamp; // Usamos el tipo Timestamp de Firestore para las marcas de tiempo
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [username, setUsername] = useState<string>('Anónimo'); // Un nombre de usuario simple por ahora
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const messagesCollectionRef = collection(db, 'messages');

  useEffect(() => {
    // Consulta para obtener mensajes ordenados por fecha de creación (ascendente).
    const q = query(messagesCollectionRef, orderBy('createdAt', 'asc'));

    // Configura un listener en tiempo real con onSnapshot.
    // Esto mantendrá los mensajes actualizados automáticamente sin recargar la página.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({
          ...(doc.data() as Omit<Message, 'id'>), // Castear los datos, excluyendo 'id'
          id: doc.id, // Añadir el ID del documento de Firestore
        });
      });
      setMessages(fetchedMessages);
      setLoading(false); // Deja de cargar una vez que se obtienen los datos iniciales
    }, (err: any) => { // *** CORRECCIÓN: Cambiado de 'Error' a 'any' ***
      console.error('Error listening to messages:', err);
      setError(err.message);
      setLoading(false);
    });

    // Limpia el listener cuando el componente se desmonte para evitar fugas de memoria.
    return () => unsubscribe();
  }, [messagesCollectionRef]); // Añadida 'messagesCollectionRef' como dependencia

  // Función para enviar un nuevo mensaje.
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessageText.trim() === '') return; // No enviar mensajes vacíos

    try {
      await addDoc(messagesCollectionRef, {
        text: newMessageText.trim(),
        user: username,
        createdAt: serverTimestamp(), // Usa serverTimestamp para una marca de tiempo consistente del servidor de Firebase
      });
      setNewMessageText(''); // Limpia el input del mensaje
      setError(null); // Limpiar cualquier error previo
    } catch (err: any) { // *** CORRECCIÓN: Cambiado de 'Error' a 'any' ***
      console.error('Error sending message:', err);
      setError(err.message);
    }
  };

  // Muestra mensajes de carga o error.
  if (loading) return <p>Cargando chat...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto', fontFamily: 'Arial, sans-serif', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Mini Chat en Tiempo Real</h1>

      {/* Selector de nombre de usuario */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="username" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tu nombre:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Anónimo"
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      {/* Área de visualización de mensajes con scroll */}
      <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No hay mensajes aún. ¡Sé el primero en saludar!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: '10px', padding: '8px', borderRadius: '5px', backgroundColor: msg.user === username ? '#e0f7fa' : '#f0f0f0', alignSelf: msg.user === username ? 'flex-end' : 'flex-start' }}>
              <strong style={{ color: msg.user === username ? '#00796b' : '#3f51b5' }}>{msg.user}:</strong> {msg.text}
              <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>
                {/* Formatea el timestamp de Firestore a una hora legible */}
                {msg.createdAt && new Date(msg.createdAt.seconds * 1000).toLocaleTimeString('es-SV')}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Formulario para enviar mensajes */}
      <form onSubmit={sendMessage} style={{ display: 'flex', marginTop: 'auto', gap: '10px' }}> {/* 'marginTop: auto' para empujar al final */}
        <input
          type="text"
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Enviar
        </button>
      </form>
    </div>
  );
}