// pages/_app.tsx
import type { NextPage } from 'next'
import type { ReactElement, ReactNode } from 'react'
import type { AppProps } from 'next/app'
import "@/styles/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from '@aws-amplify/ui-react';
import Navbar from "./components/Navbar";
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect, useState } from 'react';
import { formFields, components } from './config/auth-config';
import '@fontsource/montserrat/400.css';
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/700.css'
import LoadingScreen from './components/LoadingScreen';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout
}

Amplify.configure(outputs);

function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect from admin pages if not an admin
    if (router.pathname.startsWith('/admin') && !isAdmin) {
      router.push('/about');
      return;
    }

    // Don't redirect from the scan page if we have a 'code' query parameter
    // This prevents the auto-redirect after processing a QR code
    if (router.pathname === '/scan' && router.query.code) {
      // Don't redirect, allow the scan page to handle this
      return;
    }
  }, [router.pathname, isAdmin, router, router.query]);

  return (
    <>
      <Navbar />
      <div className="content-container">
        {children}
      </div>
    </>
  );
}

function AppContent({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  const publicRoutes = ['/', '/about', '/events', '/gallery', '/contact', '/sponsors', '/eboard'];
  // Special handling for scan route with code parameter
  const isScanWithCode = router.pathname === '/scan' && router.query.code;
  const isPublicRoute = publicRoutes.includes(router.pathname);

  useEffect(() => {
    // Initial loading delay for the 3D model
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  // If still loading, show the loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If route is public, scan page with code, or user is authenticated, load the page
  if (isPublicRoute || isAuthenticated || isScanWithCode) {
    return (
      <NavigationWrapper>
        <Component {...pageProps} />
      </NavigationWrapper>
    );
  }

  // Otherwise, force Authenticator UI
  return (
    <Authenticator formFields={formFields} components={components}>
      {({ signOut, user }) => {
        // When we get here, we know the user is authenticated
        // Trigger a check of the auth state
        checkAuth().then(() => {
          // Special case for scan page with code: go back to scan page with code after login
          const pendingScanCode = sessionStorage.getItem('pendingScanCode');
          if (pendingScanCode && router.pathname === '/scan') {
            router.push(`/scan?code=${encodeURIComponent(pendingScanCode)}`);
          } else if (pendingScanCode) {
            // If we have a stored code but we're not on the scan page, go to scan page
            router.push(`/scan?code=${encodeURIComponent(pendingScanCode)}`);
          } else {
            // Default case - no pending scan code
            router.push('/about');
          }
        });

        return (
          <NavigationWrapper>
            <Component {...pageProps} />
          </NavigationWrapper>
        );
      }}
    </Authenticator>
  );
}

export default function App(props: AppPropsWithLayout) {
  const getLayout = props.Component.getLayout 
    || ((page: React.ReactNode) => page);

  return (
    <AuthProvider>
      {getLayout(<AppContent {...props} />)}
    </AuthProvider>
  );
}