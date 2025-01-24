// components/Navbar.tsx
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'aws-amplify/auth';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { isAuthenticated, isAdmin, checkAuth } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      await checkAuth();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b w-full">
      <div style={{ margin: '0 auto', width: '90%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
        {/* Logo */}
        <Link href="/">
          <img
            src="/api/placeholder/40/40"
            alt="SASE UC Merced Logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* Nav Links */}
        <nav style={{ display: 'flex', gap: '3rem' }}>
          <Link href="/about" className="text-gray-700">About Us</Link>
          <Link href="/events" className="text-gray-700">Events</Link>
          <Link href="/gallery" className="text-gray-700">Gallery</Link>
          <Link href="/contact" className="text-gray-700">Contact</Link>
          <Link href="/sponsors" className="text-gray-700">Sponsors</Link>
          <Link href="/eboard" className="text-gray-700">E-Board</Link>
        </nav>

        {/* Search and Login */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem',
              border: '1px solid #e2e2e2',
              borderRadius: '0.5rem',
              width: '200px'
            }}
          />
          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {isAdmin && (
                <Link 
                  href="/admin"
                  style={{
                    color: '#dc2626',
                    textDecoration: 'none'
                  }}
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleSignOut}
                style={{
                  backgroundColor: '#1a56db',
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
          ) : (
            <button
              onClick={() => router.push('/login')}
              style={{
                backgroundColor: '#1a56db',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;