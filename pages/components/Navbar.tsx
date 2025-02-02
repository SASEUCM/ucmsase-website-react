// components/Navbar.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'aws-amplify/auth';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import {
  Flex,
  Button,
  View,
  Link as AmplifyLink,
  Divider,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isAdmin, checkAuth } = useAuth();

  useEffect(() => {
    if (isMobileMenuOpen) {
      disableBodyScroll(document.body);
    } else {
      enableBodyScroll(document.body);
    }
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut({ global: true });
      await checkAuth();
      router.push('/about');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdminPage = router.pathname.startsWith('/admin');

  useEffect(() => {
    const handleRouteChange = () => setIsMobileMenuOpen(false);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  const renderLinks = (isMobile = false) => {
    const linkStyle = isMobile ? { 
      padding: '1rem 0', 
      display: 'block',
      fontSize: '1.2rem'
    } : {};
    
    const commonProps = {
      style: linkStyle,
      onClick: () => isMobile && setIsMobileMenuOpen(false)
    };

    if (isAdminPage && isAdmin) {
      return (
        <>
          <Link href="/admin/dashboard" passHref legacyBehavior>
            <AmplifyLink {...commonProps}>Dashboard</AmplifyLink>
          </Link>
          <Link href="/admin/users" passHref legacyBehavior>
            <AmplifyLink {...commonProps}>Users</AmplifyLink>
          </Link>
          <Link href="/admin/events" passHref legacyBehavior>
            <AmplifyLink {...commonProps}>Events</AmplifyLink>
          </Link>
          <Link href="/admin/content" passHref legacyBehavior>
            <AmplifyLink {...commonProps}>Content</AmplifyLink>
          </Link>
          <Link href="/admin/scan" passHref legacyBehavior>
            <AmplifyLink {...commonProps}>Scan QR</AmplifyLink>
          </Link>
          <Link href="/admin/subscribers" passHref legacyBehavior>
            <AmplifyLink {...commonProps}>Subscribers</AmplifyLink>
          </Link>
          <Link href="/admin/settings" passHref legacyBehavior>
            <AmplifyLink {...commonProps}>Settings</AmplifyLink>
          </Link>
        </>
      );
    }

    return (
      <>
        <Link href="/about" passHref legacyBehavior>
          <AmplifyLink {...commonProps}>About Us</AmplifyLink>
        </Link>
        <Link href="/events" passHref legacyBehavior>
          <AmplifyLink {...commonProps}>Events</AmplifyLink>
        </Link>
        <Link href="/gallery" passHref legacyBehavior>
          <AmplifyLink {...commonProps}>Gallery</AmplifyLink>
        </Link>
        <Link href="/profile" passHref legacyBehavior>
          <AmplifyLink {...commonProps}>My Profile</AmplifyLink>
        </Link>
        <Link href="/contact" passHref legacyBehavior>
          <AmplifyLink {...commonProps}>Contact</AmplifyLink>
        </Link>
        <Link href="/sponsors" passHref legacyBehavior>
          <AmplifyLink {...commonProps}>Sponsors</AmplifyLink>
        </Link>
        <Link href="/eboard" passHref legacyBehavior>
          <AmplifyLink {...commonProps}>E-Board</AmplifyLink>
        </Link>
      </>
    );
  };

  return (
    <View
      as="header"
      backgroundColor="white"
      borderStyle="solid"
      borderWidth="0 0 1px 0"
      borderColor="#ddd"
      width="100%"
      position="relative"
      style={{ zIndex: 50 }}
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

        {/* Desktop Navigation */}
        <View display={{ base: 'none', medium: 'flex' }} as="nav">
          <Flex direction="row" gap="3rem">
            {renderLinks()}
          </Flex>
        </View>

        {/* Mobile Menu Button */}
        <Button
          display={{ medium: 'none' }}
          onClick={() => setIsMobileMenuOpen(true)}
          variation="link"
          size="large"
        >
          ☰
        </Button>

        {/* Desktop Auth Section */}
        <Flex alignItems="center" gap="1rem" display={{ base: 'none', medium: 'flex' }}>
          {isAuthenticated ? (
            <>
              {isAdmin && !isAdminPage && (
                <Link href="/admin" passHref legacyBehavior>
                  <AmplifyLink style={{ fontWeight: 'bold' }}>Admin Panel</AmplifyLink>
                </Link>
              )}
              {isAdminPage && (
                <Link href="/" passHref legacyBehavior>
                  <AmplifyLink style={{ fontWeight: 'bold' }}>View Site</AmplifyLink>
                </Link>
              )}
              <Button onClick={handleSignOut} variation="primary">
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={() => router.push('/login')} variation="primary">
              Log In
            </Button>
          )}
        </Flex>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <View
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              backgroundColor="rgba(0, 0, 0, 0.5)"
              style={{ zIndex: 100 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <View
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              backgroundColor="white"
              style={{ 
                zIndex: 101,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Scrollable container */}
              <div style={{
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                flex: 1,
                position: 'relative',
                width: '100%'
              }}>
              {/* Menu Header */}
              <View
                position="sticky"
                top="0"
                backgroundColor="white"
                padding="2rem 2rem 1rem 2rem"
                borderStyle="solid"
                borderWidth="0 0 1px 0"
                borderColor="#eee"
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <div style={{ width: '40px' }} />
                  <Button
                    onClick={() => setIsMobileMenuOpen(false)}
                    variation="link"
                    size="large"
                  >
                    ✕
                  </Button>
                </Flex>
              </View>

              {/* Menu Content */}
              <View padding="1rem 2rem 6rem 2rem">
                <Flex direction="column" gap="1rem" minHeight="calc(100vh - 85px)">
                  {renderLinks(true)}

                  <Divider margin="2rem 0" />

                  {isAuthenticated ? (
                    <>
                      {isAdmin && !isAdminPage && (
                        <Link href="/admin" passHref legacyBehavior>
                          <AmplifyLink 
                            style={{ 
                              fontWeight: 'bold', 
                              padding: '1rem 0',
                              fontSize: '1.2rem'
                            }}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Admin Panel
                          </AmplifyLink>
                        </Link>
                      )}
                      {isAdminPage && (
                        <Link href="/about" passHref legacyBehavior>
                          <AmplifyLink 
                            style={{ 
                              fontWeight: 'bold', 
                              padding: '1rem 0',
                              fontSize: '1.2rem'
                            }}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            View Site
                          </AmplifyLink>
                        </Link>
                      )}
                      <Button 
                        onClick={handleSignOut} 
                        variation="primary"
                        size="large"
                        style={{ marginTop: 'auto', marginBottom: '1rem' }}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => router.push('/login')} 
                      variation="primary"
                      size="large"
                      style={{ marginTop: 'auto', marginBottom: '1rem' }}
                    >
                      Log In
                    </Button>
                  )}
                </Flex>
              </View>
              </div>
            </View>
          </>
        )}
      </Flex>
    </View>
  );
}