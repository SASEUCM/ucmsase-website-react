import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from 'aws-amplify/auth';

const client = generateClient<Schema>();

// Type for priority values
type Priority = 'low' | 'medium' | 'high';

// Helper function to format date safely
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'No due date';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return 'Invalid date';
  }
};

export default function App() {
  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [showNewTodoForm, setShowNewTodoForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkUserGroups() {
      try {
        const session = await fetchAuthSession();
        const groups = (session.tokens?.accessToken.payload['cognito:groups'] as string[]) || [];
        console.log('User groups:', groups);
        setIsAdmin(groups.includes('admin'));
      } catch (error) {
        console.error('Error checking user groups:', error);
        setIsAdmin(false);
      }
    }

    checkUserGroups();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      // Admin sees all todos
      client.models.Todo.observeQuery().subscribe({
        next: (data) => setTodos([...data.items]),
      });
    } else {
      // Regular users only see their own todos
      client.models.Todo.observeQuery({
        filter: {
          owner: {
            eq: user?.userId
          }
        }
      }).subscribe({
        next: (data) => setTodos([...data.items]),
      });
    }
  }, [isAdmin, user]);

  async function createTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    await client.models.Todo.create({
      content: formData.get('content') as string,
      priority: formData.get('priority') as Priority,
      dueDate: new Date(formData.get('dueDate') as string).toISOString(),
      owner: user?.userId,
    });

    setShowNewTodoForm(false);
    form.reset();
  }

  async function toggleTodoStatus(todo: Schema["Todo"]["type"]) {
    await client.models.Todo.update({
      id: todo.id,
      status: todo.status === 'completed' ? 'pending' : 'completed'
    });
  }

  async function deleteTodo(id: string) {
    await client.models.Todo.delete({ id });
  }

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {isAdmin ? "Admin Dashboard" : "User Dashboard"}
          </h1>
          <p className="text-gray-600">
            Welcome, {user?.username}
            {isAdmin && " (Admin)"}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isAdmin ? "All Todos" : "My Todos"}
            </h2>
            <button
              onClick={() => setShowNewTodoForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              + New Todo
            </button>
          </div>

          {showNewTodoForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Create New Todo</h3>
                <form onSubmit={createTodo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Content</label>
                    <input 
                      name="content"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select 
                      name="priority"
                      className="w-full p-2 border rounded"
                      defaultValue="medium"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input 
                      type="date"
                      name="dueDate"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowNewTodoForm(false)}
                      className="px-4 py-2 border rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {todos.map((todo) => (
              <li 
                key={todo.id}
                className={`flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                  todo.status === 'completed' ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={todo.status === 'completed'}
                    onChange={() => toggleTodoStatus(todo)}
                    className="rounded border-gray-300"
                  />
                  <div>
                    <span className={`font-medium ${
                      todo.status === 'completed' ? 'line-through' : ''
                    }`}>
                      {todo.content}
                    </span>
                    <div className="text-sm text-gray-500 space-x-2">
                      {isAdmin && <span>Owner: {todo.owner}</span>}
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                        todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {todo.priority}
                      </span>
                      <span>
                        Due: {formatDate(todo.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={signOut}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}