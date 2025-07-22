// app/appointments/page.tsx
'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
// Importamos onSnapshot y orderBy
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebaseClient';

interface Appointment {
  id: string;
  patientName: string;
  appointmentTime: string;
  createdAt: number;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientName, setPatientName] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const appointmentsCollectionRef = collection(db, 'appointments');

  // Ahora usaremos useEffect con onSnapshot para escuchar cambios en tiempo real
  useEffect(() => {
    // La consulta para obtener citas ordenadas por fecha de creación
    const q = query(appointmentsCollectionRef, orderBy('createdAt', 'asc'));

    // Configura el listener en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsList: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointmentsList.push({
          ...(doc.data() as Omit<Appointment, 'id'>),
          id: doc.id,
        });
      });
      setAppointments(appointmentsList);
      setLoading(false); // Deja de cargar una vez que se obtienen los datos iniciales
    }, (err: unknown) => {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar las citas.');
      setLoading(false);
    });

    // Limpia el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, [appointmentsCollectionRef]);

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
      setError(null);
      // Ya NO llamamos a fetchAppointments() aquí
    } catch (err: unknown) {
      console.error('Error adding appointment:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al añadir la cita.');
    }
  };

  if (loading) return <p>Cargando citas...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Gestión de Citas Médicas</h1>

      <section style={{ marginBottom: '40px', border: '1px solid #eee', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px', color: '#007bff' }}>Agendar Nueva Cita</h2>
        <form onSubmit={addAppointment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label htmlFor="patientName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre del Paciente:</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label htmlFor="appointmentTime" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha y Hora de Cita:</label>
            <input
              type="datetime-local"
              id="appointmentTime"
              name="appointmentTime"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <button
            type="submit"
            style={{
              gridColumn: '1 / -1',
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