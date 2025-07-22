// app/page.tsx
'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
// Importamos onSnapshot y orderBy para el listener en tiempo real
import { collection, addDoc, doc, deleteDoc, updateDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

interface Todo {
  id: string;
  task_text: string;
  is_completed: boolean;
  created_at: number;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const todosCollectionRef = collection(db, 'todos');

  // Ahora usaremos useEffect con onSnapshot para escuchar cambios en tiempo real
  useEffect(() => {
    // La consulta para obtener tareas ordenadas por fecha de creación
    const q = query(todosCollectionRef, orderBy('created_at', 'asc'));

    // Configura el listener en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosList: Todo[] = [];
      querySnapshot.forEach((document) => {
        todosList.push({
          ...(document.data() as Omit<Todo, 'id'>),
          id: document.id,
        });
      });
      setTodos(todosList);
      setLoading(false); // Deja de cargar una vez que se obtienen los datos iniciales
    }, (err: unknown) => {
      console.error('Error listening to todos:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar las tareas.');
      setLoading(false);
    });

    // Limpia el listener cuando el componente se desmonte para evitar fugas de memoria.
    return () => unsubscribe();
  }, [todosCollectionRef]); // La dependencia es solo la referencia a la colección

  const addTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (newTask.trim() === '') {
      setError("La tarea no puede estar vacía.");
      return;
    }

    try {
      await addDoc(todosCollectionRef, {
        task_text: newTask.trim(),
        is_completed: false,
        created_at: Date.now(),
      });
      setNewTask(''); // Limpia el input
      setError(null); // Limpiar cualquier error previo
      // Ya NO llamamos a fetchTodos() aquí porque onSnapshot lo hace automáticamente
    } catch (err: unknown) {
      console.error('Error adding todo:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al añadir la tarea.');
    }
  };

  const toggleTodoCompletion = async (id: string, currentCompletion: boolean) => {
    try {
      const todoDoc = doc(db, 'todos', id);
      await updateDoc(todoDoc, {
        is_completed: !currentCompletion,
      });
      setError(null);
      // Ya NO llamamos a fetchTodos() aquí
    } catch (err: unknown) {
      console.error('Error updating todo:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al actualizar la tarea.');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const todoDoc = doc(db, 'todos', id);
      await deleteDoc(todoDoc);
      setError(null);
      // Ya NO llamamos a fetchTodos() aquí
    } catch (err: unknown) {
      console.error('Error deleting todo:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al eliminar la tarea.');
    }
  };

  if (loading) return <p>Cargando tareas...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Mi Lista de Tareas (Firebase Firestore)</h1>

      <form onSubmit={addTodo} style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
        <input
          type="text"
          id="newTask"
          name="newTask"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Añadir nueva tarea..."
          style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Añadir
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No hay tareas aún. ¡Añade una!</p>
        ) : (
          todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #eee',
                textDecoration: todo.is_completed ? 'line-through' : 'none',
                color: todo.is_completed ? '#888' : '#333',
                fontSize: '1.1em'
              }}
            >
              <input
                type="checkbox"
                checked={todo.is_completed}
                onChange={() => toggleTodoCompletion(todo.id, todo.is_completed)}
                style={{ marginRight: '15px', transform: 'scale(1.2)', cursor: 'pointer' }}
              />
              <span style={{ flexGrow: 1 }}>{todo.task_text}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8em'
                }}
              >
                Eliminar
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}