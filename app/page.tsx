// app/page.tsx
'use client'; // Necesario para usar Hooks de React y estado en componentes del lado del cliente de Next.js App Router

import { useEffect, useState, FormEvent, useCallback } from 'react'; // Importamos useCallback
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient'; // RUTA CORREGIDA: Sube un nivel (de app/ a la raíz) y luego entra en lib/

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

  // Usamos useCallback para memoizar fetchTodos y evitar que cambie en cada render
  // Esto nos permite añadirla como dependencia en useEffect sin causar bucles infinitos.
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocs(todosCollectionRef);
      const todosList: Todo[] = data.docs.map((document) => ({ // Renombrado 'doc' a 'document' para evitar conflicto
        ...(document.data() as Omit<Todo, 'id'>),
        id: document.id,
      })).sort((a, b) => a.created_at - b.created_at);
      setTodos(todosList);
    } catch (err: unknown) { // *** CAMBIO CLAVE: de 'any' a 'unknown' ***
      console.error('Error fetching todos:', err);
      // Cuando el error es 'unknown', debes verificar su tipo antes de acceder a propiedades como 'message'.
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar las tareas.');
    } finally {
      setLoading(false);
    }
  }, [todosCollectionRef]); // 'todosCollectionRef' es una dependencia para useCallback

  const addTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (newTask.trim() === '') return;

    try {
      await addDoc(todosCollectionRef, {
        task_text: newTask.trim(),
        is_completed: false,
        created_at: Date.now(),
      });
      setNewTask('');
      fetchTodos();
      setError(null); // Limpiar cualquier error previo
    } catch (err: unknown) { // *** CAMBIO CLAVE: de 'any' a 'unknown' ***
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
      fetchTodos();
    } catch (err: unknown) { // *** CAMBIO CLAVE: de 'any' a 'unknown' ***
      console.error('Error updating todo:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al actualizar la tarea.');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const todoDoc = doc(db, 'todos', id);
      await deleteDoc(todoDoc);
      fetchTodos();
    } catch (err: unknown) { // *** CAMBIO CLAVE: de 'any' a 'unknown' ***
      console.error('Error deleting todo:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al eliminar la tarea.');
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]); // Añadida 'fetchTodos' como dependencia

  if (loading) return <p>Cargando tareas...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Mi Lista de Tareas (Firebase Firestore)</h1>

      <form onSubmit={addTodo} style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
        <input
          type="text"
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