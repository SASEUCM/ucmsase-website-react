// components/AdminNavbar.tsx
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'aws-amplify/auth';

const AdminNavbar = () => {
  const router = useRouter();
  const { userEmail, checkAuth } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      await checkAuth(); // Refresh auth state after signing out
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b w-full">
      <div style={{ margin: '0 auto', width: '90%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
        {/* Logo */}
        <Link href="/admin">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative', width: '40px', height: '40px' }}>
              <Image
                src="/api/placeholder/40/40"
                alt="SASE UC Merced Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <span style={{ color: '#dc2626', fontWeight: 600 }}>Admin Panel</span>
          </div>
        </Link>

        {/* Admin Nav Links */}
        <nav style={{ display: 'flex', gap: '3rem' }}>
          <Link href="/admin/dashboard" className="text-gray-700">Dashboard</Link>
          <Link href="/admin/users" className="text-gray-700">Manage Users</Link>
          <Link href="/admin/events" className="text-gray-700">Manage Events</Link>
          <Link href="/admin/content" className="text-gray-700">Content</Link>
          <Link href="/admin/settings" className="text-gray-700">Settings</Link>
          <Link href="/admin/subscribers" className="text-gray-700">Subscribers</Link>
        </nav>

        {/* Admin Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link 
            href="/"
            style={{ color: '#4b5563', textDecoration: 'none' }}
          >
            View Public Site
          </Link>
          <button
            onClick={handleSignOut}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;