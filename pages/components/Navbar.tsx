import { useState, useEffect, useRef } from 'react';
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
import { Menu, X } from 'lucide-react';
import * as THREE from 'three';
import '@aws-amplify/ui-react/styles.css';

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
  const router = useRouter();
  const { isAuthenticated, isAdmin, checkAuth } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const bubblesRef = useRef<Map<string, BubbleState>>(new Map());
  const linksRef = useRef<Map<string, HTMLElement>>(new Map());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navLinks = [
    { id: 'about', label: 'About Us', path: '/about' },
    { id: 'events', label: 'Events', path: '/events' },
    { id: 'gallery', label: 'Gallery', path: '/gallery' },
    { id: 'profile', label: 'My Profile', path: '/profile' },
    { id: 'schedule', label: 'Schedule', path: '/schedule' },
    { id: 'contact', label: 'Contact', path: '/contact' },
    { id: 'eboard', label: 'E-Board', path: '/eboard' }
  ];

  const adminNavLinks = [ // Admin-specific navigation
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { id: 'users', label: 'Users', path: '/admin/users' },
    { id: 'events', label: 'Events', path: '/admin/events' },
    { id: 'content', label: 'Content', path: '/admin/content' },
    { id: 'scan', label: 'Scan QR', path: '/admin/scan' },
    { id: 'schedule', label: 'Schedule', path: '/schedule' },
    { id: 'subscribers', label: 'Subscribers', path: '/admin/subscribers' },
    { id: 'settings', label: 'Settings', path: '/admin/settings' },
  ];


  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      antialias: true
    });

    renderer.setSize(window.innerWidth, NAVBAR_HEIGHT);
    camera.position.z = 100;

    // Create rounded rectangle
    const roundedRectShape = new THREE.Shape();
    const width = 100;
    const height = NAVBAR_HEIGHT;

    roundedRectShape.moveTo(-width / 2, -height / 2);
    roundedRectShape.lineTo(-width / 2, height / 2 - CORNER_RADIUS);
    roundedRectShape.quadraticCurveTo(-width / 2, height / 2, -width / 2 + CORNER_RADIUS, height / 2);
    roundedRectShape.lineTo(width / 2 - CORNER_RADIUS, height / 2);
    roundedRectShape.quadraticCurveTo(width / 2, height / 2, width / 2, height / 2 - CORNER_RADIUS);
    roundedRectShape.lineTo(width / 2, -height / 2);
    roundedRectShape.lineTo(-width / 2, -height / 2);

    const geometry = new THREE.ShapeGeometry(roundedRectShape);

    // Determine which links to use
    const linksToUse = router.pathname.startsWith('/admin') && isAdmin ? adminNavLinks : navLinks;

    linksToUse.forEach(link => {
      const material = new THREE.MeshBasicMaterial({
        color: '#1a54c4',
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });

      const bubble = new THREE.Mesh(geometry, material);
      bubble.scale.set(1, 0, 1);
      scene.add(bubble);

      bubblesRef.current.set(link.id, {
        mesh: bubble,
        element: null,
        active: false,
        color: new THREE.Color('#1a54c4')
      });
    });


    // Admin Links Bubbles - NEW SECTION
    const adminLinks = [
      { id: 'admin-panel', label: 'Admin Panel', path: '/admin', condition: isAdmin && !router.pathname.startsWith('/admin') },
      { id: 'view-site', label: 'View Site', path: '/', condition: isAdmin && router.pathname.startsWith('/admin') }
    ];

    adminLinks.forEach(link => {
      if (link.condition) { // Only create bubble if condition is true
        const material = new THREE.MeshBasicMaterial({
          color: '#1a54c4',
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide
        });

        const bubble = new THREE.Mesh(geometry, material);
        bubble.scale.set(1, 0, 1);
        scene.add(bubble);

        bubblesRef.current.set(link.id, {
          mesh: bubble,
          element: null,
          active: false,
          color: new THREE.Color('#1a54c4')
        });
      }
    });
    // END NEW SECTION

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      bubblesRef.current.forEach((bubbleState, linkId) => {
        const element = linksRef.current.get(linkId);
        if (element && containerRef.current) {
          const rect = element.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          const x = rect.left - containerRect.left + rect.width / 2 - containerRect.width / 2;
          bubbleState.mesh.position.set(x, 0, 0);

          bubbleState.mesh.scale.x = rect.width / 100;

          const targetScaleY = bubbleState.active ? 1 : 0;
          bubbleState.mesh.scale.y = THREE.MathUtils.lerp(
            bubbleState.mesh.scale.y,
            targetScaleY,
            0.2
          );

          const targetColor = bubbleState.active ? new THREE.Color('#ffffff') : new THREE.Color('#1a54c4');
          bubbleState.color.lerp(targetColor, 0.2);
          (bubbleState.mesh.material as THREE.MeshBasicMaterial).color = bubbleState.color;

          (bubbleState.mesh.material as THREE.MeshBasicMaterial).opacity =
            bubbleState.active ? 1 : 0.15;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const width = window.innerWidth;
      camera.left = width / -2;
      camera.right = width / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, NAVBAR_HEIGHT);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      renderer.dispose();
      geometry.dispose();
      bubblesRef.current.forEach(bubble => {
        (bubble.mesh.material as THREE.MeshBasicMaterial).dispose();
      });
    };
  }, [isMobile, isAdmin, router.pathname]);

  const handleLinkHover = (linkId: string, hovering: boolean) => {
    if (isMobile) return;
    const bubbleState = bubblesRef.current.get(linkId);
    if (bubbleState) {
      bubbleState.active = hovering;

      const element = linksRef.current.get(linkId);
      if (element) {
        if (hovering) {
          element.classList.add('nav-link-hover');
        } else {
          element.classList.remove('nav-link-hover');
        }
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

  const renderLinks = () => {
    // Choose links based on route and admin status
    const linksToRender = router.pathname.startsWith('/admin') && isAdmin ? adminNavLinks : navLinks;

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
          {/* Admin Panel Link - Desktop Version */}
          {isAdmin && !router.pathname.startsWith('/admin') && (
            <Link href="/admin" passHref legacyBehavior>
              <AmplifyLink
                className="nav-link"
                ref={(el) => {
                  if (el) linksRef.current.set('admin-panel', el);
                }}
                onMouseEnter={() => handleLinkHover('admin-panel', true)}
                onMouseLeave={() => handleLinkHover('admin-panel', false)}
              >
                Admin Panel
              </AmplifyLink>
            </Link>
          )}

          {/* View Site Link - Desktop Version */}
          {isAdmin && router.pathname.startsWith('/admin') && (
            <Link href="/" passHref legacyBehavior>
              <AmplifyLink
                className="nav-link"
                ref={(el) => {
                  if (el) linksRef.current.set('view-site', el);
                }}
                onMouseEnter={() => handleLinkHover('view-site', true)}
                onMouseLeave={() => handleLinkHover('view-site', false)}
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
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {!isMobile && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        />
      )}

      <Flex
        margin="0 auto"
        width="90%"
        height="100%"
        justifyContent="space-between"
        alignItems="center"
        style={{ position: 'relative', zIndex: 1 }}
      >
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

        {isMobile ? (
          <>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-button"
            >
              {isMobileMenuOpen ? (
                <X size={24} color="white" />
              ) : (
                <Menu size={24} color="white" />
              )}
            </button>

            {isMobileMenuOpen && (
              <div className="mobile-menu">
                <Flex direction="column" gap="1rem">
                  {renderLinks()}

                  {/* Admin Panel Link - Mobile Version */}
                  {isAdmin && !router.pathname.startsWith('/admin') && (
                    <Link href="/admin" passHref legacyBehavior>
                      <AmplifyLink
                        className="nav-link"
                        onClick={handleMobileLinkClick}
                      >
                        Admin Panel
                      </AmplifyLink>
                    </Link>
                  )}

                  {/* View Site Link - Mobile Version */}
                  {isAdmin && router.pathname.startsWith('/admin') && (
                    <Link href="/" passHref legacyBehavior>
                      <AmplifyLink
                        className="nav-link"
                        onClick={handleMobileLinkClick}
                      >
                        View Site
                      </AmplifyLink>
                    </Link>
                  )}

                  {isAuthenticated ? (
                    <Button
                      onClick={handleSignOut}
                      className="auth-button"
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
                    >
                      Log In
                    </Button>
                  )}
                </Flex>
              </div>
            )}
          </>
        ) : (
          <>
            <Flex as="nav" gap="2rem">
              {renderLinks()}
            </Flex>

            <Flex gap="1rem">
              {isAuthenticated ? (
                <Button
                  onClick={handleSignOut}
                  className="auth-button"
                >
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
        .nav-link {
          font-weight: 500;
          padding: 0.75rem 1.25rem;
          position: relative;
          transition: all 0.3s ease;
          font-size: 1rem;
          color: #ffffff;
        }

        .nav-link-hover {
          color: #000000 !important;
        }

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

        .mobile-menu-button {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          z-index: 50;
        }

        .mobile-menu {
          position: fixed;
          top: ${NAVBAR_HEIGHT}px;
          left: 0;
          right: 0;
          background: #0a1930;
          padding: 1rem;
          animation: slideDown 0.3s ease-out;
          z-index: 40;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: ${MOBILE_BREAKPOINT}px) {
          .nav-link {
            width: 100%;
            text-align: center;
            padding: 1rem;
          }

          .auth-button {
            width: 100%;
            margin-top: 1rem;
          }
        }
      `}</style>
    </View>
  );
};

export default Navbar;