import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'aws-amplify/auth';
import { Flex, Button, View, Link as AmplifyLink } from '@aws-amplify/ui-react';
import { Menu, X } from 'lucide-react';
import * as THREE from 'three';
import '@aws-amplify/ui-react/styles.css';
import useViewportHeight from '../hooks/useViewportHeight';

const NAVBAR_HEIGHT = 80;
const CORNER_RADIUS = 8;
const MOBILE_BREAKPOINT = 768;

interface BubbleState {
  mesh: THREE.Mesh;
  element: HTMLElement | null;
  active: boolean;
  color: THREE.Color;
}

const Navbar = () => {
  useViewportHeight(); // This sets the --vh variable on mount/resize

  const router = useRouter();
  const { isAuthenticated, isAdmin, checkAuth } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const bubblesRef = useRef<Map<string, BubbleState>>(new Map());
  const linksRef = useRef<Map<string, HTMLElement>>(new Map());

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navLinks = useMemo(() => [
    { id: 'about', label: 'About Us', path: '/about' },
    { id: 'events', label: 'Events', path: '/events' },
    { id: 'gallery', label: 'Gallery', path: '/gallery' },
    { id: 'profile', label: 'My Profile', path: '/profile' },
    { id: 'schedule', label: 'Schedule', path: '/schedule' },
    { id: 'contact', label: 'Contact', path: '/contact' },
    { id: 'eboard', label: 'E-Board', path: '/eboard' }
  ], []);

  const adminNavLinks = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { id: 'users', label: 'Users', path: '/admin/users' },
    { id: 'events', label: 'Events', path: '/admin/events' },
    { id: 'content', label: 'Content', path: '/admin/content' },
    { id: 'scan', label: 'Scan QR', path: '/admin/scan' },
    { id: 'schedule', label: 'Schedule', path: '/schedule' },
    { id: 'subscribers', label: 'Subscribers', path: '/admin/subscribers' },
    { id: 'settings', label: 'Settings', path: '/admin/settings' },
  ], []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lock/unlock body scroll when menu opens/closes
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isMobileMenuOpen]);

  // Three.js for desktop
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || isMobile) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      NAVBAR_HEIGHT / 2,
      -NAVBAR_HEIGHT / 2,
      1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, NAVBAR_HEIGHT);
    camera.position.z = 100;

    const roundedRectShape = new THREE.Shape();
    const width = 100;
    const height = NAVBAR_HEIGHT;

    // Create a rounded rectangle
    roundedRectShape.moveTo(-width / 2, -height / 2);
    roundedRectShape.lineTo(-width / 2, height / 2 - CORNER_RADIUS);
    roundedRectShape.quadraticCurveTo(
      -width / 2,
      height / 2,
      -width / 2 + CORNER_RADIUS,
      height / 2
    );
    roundedRectShape.lineTo(width / 2 - CORNER_RADIUS, height / 2);
    roundedRectShape.quadraticCurveTo(
      width / 2,
      height / 2,
      width / 2,
      height / 2 - CORNER_RADIUS
    );
    roundedRectShape.lineTo(width / 2, -height / 2);
    roundedRectShape.lineTo(-width / 2, -height / 2);

    const geometry = new THREE.ShapeGeometry(roundedRectShape);

    // Decide which links to display
    const linksToUse =
      router.pathname.startsWith('/admin') && isAdmin
        ? adminNavLinks
        : navLinks;

    // Create bubble for each link
    linksToUse.forEach((link) => {
      const material = new THREE.MeshBasicMaterial({
        color: '#1a54c4',
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      });

      const bubble = new THREE.Mesh(geometry, material);
      bubble.scale.set(1, 0, 1);
      scene.add(bubble);

      bubblesRef.current.set(link.id, {
        mesh: bubble,
        element: null,
        active: false,
        color: new THREE.Color('#1a54c4'),
      });
    });

    // Extra toggles for "Admin Panel", "View Site", "Elections", and "Exec Chairs"
    const extraLinks = [
      {
        id: 'admin-panel',
        label: 'Admin Panel',
        path: '/admin',
        condition: isAdmin && !router.pathname.startsWith('/admin'),
      },
      {
        id: 'view-site',
        label: 'View Site',
        path: '/',
        condition: isAdmin && router.pathname.startsWith('/admin'),
      },
      {
        id: 'elections',
        label: 'Elections',
        path: '/elections',
        condition: isAuthenticated,
      },
      {
        id: 'exec-chairs',
        label: 'Exec Chairs',
        path: '/ExecChairsAppPage',
        condition: isAuthenticated,
      },
    ];
    extraLinks.forEach((link) => {
      if (link.condition) {
        const material = new THREE.MeshBasicMaterial({
          color: '#1a54c4',
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
        });

        const bubble = new THREE.Mesh(geometry, material);
        bubble.scale.set(1, 0, 1);
        scene.add(bubble);

        bubblesRef.current.set(link.id, {
          mesh: bubble,
          element: null,
          active: false,
          color: new THREE.Color('#1a54c4'),
        });
      }
    });

    // Animate the bubbles
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      bubblesRef.current.forEach((bubbleState, linkId) => {
        const element = linksRef.current.get(linkId);
        if (element && containerRef.current) {
          const rect = element.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          const x =
            rect.left - containerRect.left +
            rect.width / 2 -
            containerRect.width / 2;
          bubbleState.mesh.position.set(x, 0, 0);

          // Horizontal scale
          bubbleState.mesh.scale.x = rect.width / 100;

          // Vertical scale
          const targetScaleY = bubbleState.active ? 1 : 0;
          bubbleState.mesh.scale.y = THREE.MathUtils.lerp(
            bubbleState.mesh.scale.y,
            targetScaleY,
            0.2
          );

          // Color transition
          const targetColor = bubbleState.active
            ? new THREE.Color('#ffffff')
            : new THREE.Color('#1a54c4');
          bubbleState.color.lerp(targetColor, 0.2);
          (bubbleState.mesh.material as THREE.MeshBasicMaterial).color =
            bubbleState.color;

          // Opacity
          (bubbleState.mesh.material as THREE.MeshBasicMaterial).opacity =
            bubbleState.active ? 1 : 0.15;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handling
    const handleResize = () => {
      const width = window.innerWidth;
      camera.left = width / -2;
      camera.right = width / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, NAVBAR_HEIGHT);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      geometry.dispose();
      const currentBubbles = bubblesRef.current;
      currentBubbles.forEach((bubble) => {
        (bubble.mesh.material as THREE.MeshBasicMaterial).dispose();
      });
    };
  }, [isMobile, isAdmin, router.pathname, isAuthenticated, navLinks, adminNavLinks]);

  // Hover effect on desktop
  const handleLinkHover = (linkId: string, hovering: boolean) => {
    if (isMobile) return; // No hover on mobile
    const bubbleState = bubblesRef.current.get(linkId);
    if (bubbleState) {
      bubbleState.active = hovering;
      const element = linksRef.current.get(linkId);
      if (element) {
        if (hovering) element.classList.add('nav-link-hover');
        else element.classList.remove('nav-link-hover');
      }
    }
  };

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

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Which set of links to render
  const renderLinks = () => {
    const linksToRender =
      router.pathname.startsWith('/admin') && isAdmin
        ? adminNavLinks
        : navLinks;

    return (
      <>
        {linksToRender.map(({ id, label, path }) => (
          <Link key={id} href={path} passHref legacyBehavior>
            <AmplifyLink
              className="nav-link"
              ref={(el) => {
                if (el) linksRef.current.set(id, el);
              }}
              onMouseEnter={() => handleLinkHover(id, true)}
              onMouseLeave={() => handleLinkHover(id, false)}
              onClick={handleMobileLinkClick}
            >
              {label}
            </AmplifyLink>
          </Link>
        ))}
        
        {/* Elections link only for authenticated users */}
        {isAuthenticated && (
          <>
            <Link href="/elections" passHref legacyBehavior>
              <AmplifyLink
                className="nav-link"
                ref={(el) => {
                  if (el) linksRef.current.set('elections', el);
                }}
                onMouseEnter={() => handleLinkHover('elections', true)}
                onMouseLeave={() => handleLinkHover('elections', false)}
                onClick={handleMobileLinkClick}
              >
                Elections
              </AmplifyLink>
            </Link>
            <Link href="/ExecChairsAppPage" passHref legacyBehavior>
              <AmplifyLink
                className="nav-link"
                ref={(el) => {
                  if (el) linksRef.current.set('exec-chairs', el);
                }}
                onMouseEnter={() => handleLinkHover('exec-chairs', true)}
                onMouseLeave={() => handleLinkHover('exec-chairs', false)}
                onClick={handleMobileLinkClick}
              >
                Exec Chairs
              </AmplifyLink>
            </Link>
          </>
        )}

        {/* Toggle between Admin Panel & View Site for admins */}
        {isAdmin && !router.pathname.startsWith('/admin') && (
          <Link href="/admin" passHref legacyBehavior>
            <AmplifyLink
              className="nav-link"
              ref={(el) => {
                if (el) linksRef.current.set('admin-panel', el);
              }}
              onMouseEnter={() => handleLinkHover('admin-panel', true)}
              onMouseLeave={() => handleLinkHover('admin-panel', false)}
              onClick={handleMobileLinkClick}
            >
              Admin Panel
            </AmplifyLink>
          </Link>
        )}

        {isAdmin && router.pathname.startsWith('/admin') && (
          <Link href="/" passHref legacyBehavior>
            <AmplifyLink
              className="nav-link"
              ref={(el) => {
                if (el) linksRef.current.set('view-site', el);
              }}
              onMouseEnter={() => handleLinkHover('view-site', true)}
              onMouseLeave={() => handleLinkHover('view-site', false)}
              onClick={handleMobileLinkClick}
            >
              View Site
            </AmplifyLink>
          </Link>
        )}
      </>
    );
  };

  return (
    <View
      as="header"
      ref={containerRef}
      style={{
        width: '100%',
        height: `${NAVBAR_HEIGHT}px`,
        background: '#0a1930',
        position: 'fixed',
        overflow: 'visible', // Changed from 'hidden' to 'visible' to allow mobile menu to show
        zIndex: 999,
        top: 0,
        left: 0,
      }}
    >
      {/* Only render Three.js canvas on desktop */}
      {!isMobile && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      )}

      <Flex
        margin="0 auto"
        width="90%"
        height="100%"
        justifyContent="space-between"
        alignItems="center"
        style={{ position: 'relative', zIndex: 1000 }}
      >
        {/* Logo */}
        <Link href="/about" passHref legacyBehavior>
          <AmplifyLink style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/logo.png"
              alt="SASE UC Merced Logo"
              width={48}
              height={48}
              style={{ objectFit: 'contain' }}
            />
          </AmplifyLink>
        </Link>

        {/* Mobile vs. Desktop */}
        {isMobile ? (
          <>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-button"
              style={{ display: 'block' }} // Ensure button is visible
            >
              {isMobileMenuOpen ? (
                <X size={24} color="white" />
              ) : (
                <Menu size={24} color="white" />
              )}
            </button>

            {/* Full-screen mobile menu */}
            {isMobileMenuOpen && (
              <div 
                className="mobile-menu"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: 'calc(var(--vh, 1vh) * 100)',
                  background: '#0a1930',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1rem'
                }}
              >
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="close-button"
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <X size={24} color="white" />
                </button>

                {/* Pushed content down slightly below close button */}
                <div 
                  className="mobile-menu-content"
                  style={{
                    marginTop: '4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                >
                  <Flex
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    gap="1rem"
                    width="100%"
                  >
                    {renderLinks()}
                    {isAuthenticated ? (
                      <Button 
                        onClick={handleSignOut} 
                        className="auth-button"
                        style={{
                          width: '100%',
                          maxWidth: '300px',
                          margin: '1rem 0'
                        }}
                      >
                        Sign Out
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          router.push('/login');
                          setIsMobileMenuOpen(false);
                        }}
                        className="auth-button"
                        style={{
                          width: '100%',
                          maxWidth: '300px',
                          margin: '1rem 0'
                        }}
                      >
                        Log In
                      </Button>
                    )}
                  </Flex>
                </div>
              </div>
            )}
          </>
        ) : (
          // Desktop nav
          <>
            <Flex as="nav" gap="2rem">
              {renderLinks()}
            </Flex>

            <Flex gap="1rem">
              {isAuthenticated ? (
                <Button onClick={handleSignOut} className="auth-button">
                  Sign Out
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/login')}
                  className="auth-button"
                >
                  Log In
                </Button>
              )}
            </Flex>
          </>
        )}
      </Flex>

      <style jsx global>{`
        /* Basic reset for padding/margin might help on mobile */
        html,
        body {
          margin: 0;
          padding: 0;
        }

        /* The custom property that approximates the mobile viewport height */
        :root {
          --vh: 100%;
        }

        /* Prevent body scroll when .no-scroll is added */
        body.no-scroll {
          overflow: hidden;
          position: fixed;
          width: 100%;
        }

        /* Nav Link Styles */
        .nav-link {
          font-weight: 500;
          padding: 0.75rem 1.25rem;
          position: relative;
          transition: all 0.3s ease;
          font-size: 1rem;
          color: #ffffff;
          text-decoration: none;
        }

        .nav-link-hover {
          color: #000000 !important;
        }

        /* Auth Button */
        .auth-button {
          background: transparent !important;
          border: 2px solid #1a54c4 !important;
          color: #ffffff !important;
          border-radius: 20px !important;
          padding: 0.5rem 1.5rem !important;
          transition: all 0.3s ease !important;
        }

        .auth-button:hover {
          background: #1a54c4 !important;
          transform: translateY(-2px);
        }

        /* Mobile Menu Button (Hamburger) */
        .mobile-menu-button {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          z-index: 50;
          display: block !important;
        }

        /* Mobile Menu Links */
        @media (max-width: ${MOBILE_BREAKPOINT}px) {
          .nav-link {
            width: 100%;
            text-align: center;
            padding: 1rem;
            font-size: 1.2rem;
            margin: 0.5rem 0;
            color: white !important;
          }

          .auth-button {
            width: 80%;
            margin: 1rem auto;
            padding: 0.75rem !important;
          }
        }

        /* Fade-in animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .mobile-menu {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </View>
  );
};

export default Navbar;