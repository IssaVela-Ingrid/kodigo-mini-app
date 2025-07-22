// app/appointments/page.tsx
'use client'; // Necesario para usar Hooks de React y estado en componentes del lado del cliente

import { useEffect, useState, FormEvent, useCallback } from 'react'; // Agregamos useCallback
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebaseClient'; // RUTA CORREGIDA: Sube dos niveles (de appointments/ a app/, luego a la raíz) y luego entra en lib/

// Define la interfaz para una cita
interface Appointment {
  id: string;
  patientName: string;
  appointmentTime: string; // Guardaremos la fecha y hora como string para simplicidad inicial
  createdAt: number;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientName, setPatientName] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Referencia a la colección 'appointments' en Firestore
  const appointmentsCollectionRef = collection(db, 'appointments');

  // Función para obtener las citas de Firestore (GET endpoint)
  // Usamos useCallback para memoizar fetchAppointments y evitar que cambie en cada render
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocs(appointmentsCollectionRef);
      const appointmentsList: Appointment[] = data.docs.map((doc) => ({
        ...(doc.data() as Omit<Appointment, 'id'>),
        id: doc.id,
      })).sort((a, b) => a.createdAt - b.createdAt); // Ordenar por fecha de creación
      setAppointments(appointmentsList);
    } catch (err: unknown) { // *** CAMBIO CLAVE: de 'any' a 'unknown' ***
      console.error('Error fetching appointments:', err);
      // Cuando el error es 'unknown', debes verificar su tipo antes de acceder a propiedades como 'message'.
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar las citas.');
    } finally {
      setLoading(false);
    }
  }, [appointmentsCollectionRef]); // Añadimos 'appointmentsCollectionRef' como dependencia de useCallback

  // Función para añadir una nueva cita (POST endpoint)
  const addAppointment = async (e: FormEvent) => {
    e.preventDefault();
    if (patientName.trim() === '' || appointmentTime.trim() === '') {
      setError("Por favor, rellena todos los campos.");
      return;
    }

    try {
      await addDoc(appointmentsCollectionRef, {
        patientName: patientName.trim(),
        appointmentTime: appointmentTime.trim(),
        createdAt: Date.now(),
      });
      setPatientName('');
      setAppointmentTime('');
      fetchAppointments(); // Recarga la lista para ver la nueva cita
      setError(null); // Limpiar cualquier error previo
    } catch (err: unknown) { // *** CAMBIO CLAVE: de 'any' a 'unknown' ***
      console.error('Error adding appointment:', err);
      // Cuando el error es 'unknown', debes verificar su tipo antes de acceder a propiedades como 'message'.
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al añadir la cita.');
    }
  };

  // Cargar las citas al montar el componente
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]); // Añadida 'fetchAppointments' como dependencia

  if (loading) return <p>Cargando citas...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Gestión de Citas Médicas</h1>

      {/* Formulario para añadir citas */}
      <section style={{ marginBottom: '40px', border: '1px solid #eee', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px', color: '#007bff' }}>Agendar Nueva Cita</h2>
        <form onSubmit={addAppointment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label htmlFor="patientName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre del Paciente:</label>
            <input
              type="text"
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label htmlFor="appointmentTime" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha y Hora de Cita:</label>
            <input
              type="datetime-local" // Tipo de input para fecha y hora
              id="appointmentTime"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <button
            type="submit"
            style={{
              gridColumn: '1 / -1', // Ocupa ambas columnas
              padding: '12px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1.1em',
              marginTop: '10px'
            }}
          >
            Agendar Cita
          </button>
        </form>
      </section>

      {/* Lista de citas agendadas */}
      <section style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px', color: '#007bff' }}>Citas Agendadas</h2>
        {appointments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No hay citas agendadas aún.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #eee',
                  fontSize: '1.1em',
                  color: '#333'
                }}
              >
                <span><strong>{appointment.patientName}</strong> - {new Date(appointment.appointmentTime).toLocaleString('es-SV')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}