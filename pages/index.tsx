import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from 'aws-amplify/auth';
import { type Subscription } from 'rxjs';

const client = generateClient<Schema>();

export default function App() {
  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkUserGroups() {
      try {
        const session = await fetchAuthSession();
        const groups = (session.tokens?.accessToken.payload['cognito:groups'] as string[]) || [];
        setIsAdmin(groups.includes('admin'));
      } catch (error) {
        console.error('Error checking user groups:', error);
        setIsAdmin(false);
      }
    }
    checkUserGroups();
  }, []);

  useEffect(() => {
    let subscription: Subscription | undefined;
    async function setupSubscription() {
      try {
        const { data: initialData } = await client.models.Todo.list();
        setTodos(initialData);

        subscription = client.models.Todo.observeQuery().subscribe({
          next: ({ items }) => {
            setTodos(items);
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
  }, []);

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

  return (
    <main>
      <h1>{isAdmin ? "Admin Dashboard" : "My todos"}</h1>
      <p>Welcome, {user?.signInDetails?.loginId || "user"}</p>
      <button onClick={createTodo}>+ new</button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <button onClick={signOut}>Sign out</button>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/gen2/start/quickstart/nextjs-pages-router/">
          Review next steps of this tutorial.
        </a>
      </div>
    </main>
  );
}