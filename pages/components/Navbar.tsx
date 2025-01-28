// components/Navbar.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'aws-amplify/auth';
import {
  Flex,
  Button,
  View,
  Link as AmplifyLink,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { isAuthenticated, isAdmin, checkAuth } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut({ global: true });
      await checkAuth();
      router.push('/about');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View
      as="header"
      backgroundColor="white"
      borderStyle="solid"
      borderWidth="0 0 1px 0"
      borderColor="#ddd"
      width="100%"
    >
      <Flex
        margin="0 auto"
        width="90%"
        justifyContent="space-between"
        alignItems="center"
        padding="1rem 0"
      >
        {/* Logo */}
        <Link href="/about" passHref legacyBehavior>
          <AmplifyLink>
            <div style={{ position: 'relative', height: '40px', width: 'auto' }}>
              <Image
                src="/logo.png"
                alt="SASE UC Merced Logo"
                height={40}
                width={40}
                style={{ 
                  objectFit: 'contain',
                  width: 'auto',
                  height: '100%'
                }}
              />
            </div>
          </AmplifyLink>
        </Link>

        {/* Nav Links */}
        <Flex as="nav" direction="row" gap="3rem">
          <Link href="/about" passHref legacyBehavior>
            <AmplifyLink className="navbar-link">About Us</AmplifyLink>
          </Link>
          <Link href="/events" passHref legacyBehavior>
            <AmplifyLink className="navbar-link">Events</AmplifyLink>
          </Link>
          <Link href="/gallery" passHref legacyBehavior>
            <AmplifyLink className="navbar-link">Gallery</AmplifyLink>
          </Link>
          <Link href="/contact" passHref legacyBehavior>
            <AmplifyLink className="navbar-link">Contact</AmplifyLink>
          </Link>
          <Link href="/sponsors" passHref legacyBehavior>
            <AmplifyLink className="navbar-link">Sponsors</AmplifyLink>
          </Link>
          <Link href="/eboard" passHref legacyBehavior>
            <AmplifyLink className="navbar-link">E-Board</AmplifyLink>
          </Link>
        </Flex>

        {/* Auth Area */}
        <Flex alignItems="center" gap="1rem">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href="/admin" passHref legacyBehavior>
                  <AmplifyLink
                    className="navbar-link"
                    style={{ fontWeight: 'bold' }}
                  >
                    Admin Panel
                  </AmplifyLink>
                </Link>
                <Link href="/admin/subscribers" passHref legacyBehavior>
                    <AmplifyLink className="navbar-link">Subscribers</AmplifyLink>
                  </Link>
                </div>
              )}
              <Button
                onClick={handleSignOut}
                variation="primary"
                className="blue-button"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={() => router.push('/login')}
              variation="primary"
              className='blue-button'
            >
              Log In
            </Button>
          )}
        </Flex>
      </Flex>
    </View>
  );
}