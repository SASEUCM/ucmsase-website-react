// index.tsx
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useAuth } from "./context/AuthContext";
import { type Subscription } from 'rxjs';

const client = generateClient<Schema>();

export default function App() {
  const { isAuthenticated, isAdmin, userEmail } = useAuth();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    let subscription: Subscription | undefined;
    
    async function setupSubscription() {
      if (!isAuthenticated) return;
      
      try {
        const { data: initialData } = await client.models.Todo.list();
        setTodos(initialData);

        subscription = client.models.Todo.observeQuery()
          .subscribe({
            next: ({ items }) => {
              setTodos([...items]);
            },
            error: (error) => console.error('Subscription error:', error)
          });
      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    }

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isAuthenticated]);

  async function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      try {
        await client.models.Todo.create({
          content
        });
      } catch (error) {
        console.error('Error creating todo:', error);
      }
    }
  }

  // If not authenticated, show a welcome message
  if (!isAuthenticated) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to Our Todo App</h1>
        <p className="mb-4">Please sign in to manage your todos.</p>
        <p>You can still browse our public pages using the navigation above.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        {isAdmin ? "Admin Dashboard" : "My Todos"}
      </h1>
      <p className="mb-4">Welcome, {userEmail}</p>
      
      <button 
        onClick={createTodo}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        + New Todo
      </button>
      
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li 
            key={todo.id}
            className="p-3 bg-gray-50 rounded shadow"
          >
            {todo.content}
          </li>
        ))}
      </ul>
      
      {isAuthenticated && (
        <div className="mt-8 p-4 bg-green-50 rounded">
          🥳 App successfully connected. Try creating a new todo.
          <br />
          <a 
            href="https://docs.amplify.aws/gen2/start/quickstart/nextjs-pages-router/"
            className="text-blue-500 hover:underline"
          >
            Review next steps of this tutorial.
          </a>
        </div>
      )}
    </main>
  );
}