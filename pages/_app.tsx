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
import AdminNavbar from "./components/AdminNavbar";
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';

// 1. Extend the NextPage type to allow an optional getLayout function
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

// 2. Extend AppProps so that `Component` is our NextPageWithLayout
interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout
}

Amplify.configure(outputs);

// A wrapper to decide which navbar to show
function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  
  const isAdminRoute = router.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute && !isAdmin) {
      router.push('/');
    }
  }, [isAdminRoute, isAdmin, router]);

  return (
    <>
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      <div className="content-container">
        {children}
      </div>
    </>
  );
}

// The core logic that decides how to render based on auth
function AppContent({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const publicRoutes = ['/', '/about', '/events', '/gallery', '/contact', '/sponsors'];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  // If route is public or user is authenticated, load the page
  if (isPublicRoute || isAuthenticated) {
    return (
      <NavigationWrapper>
        <Component {...pageProps} />
      </NavigationWrapper>
    );
  }

  // Otherwise, force Authenticator UI
  return (
    <Authenticator>
      {() => (
        <NavigationWrapper>
          <Component {...pageProps} />
        </NavigationWrapper>
      )}
    </Authenticator>
  );
}

// The main App component
export default function App(props: AppPropsWithLayout) {
  // Use `getLayout` if it exists; otherwise just render the page as-is
  const getLayout = props.Component.getLayout 
    || ((page: React.ReactNode) => page);

  return (
    <AuthProvider>
      {getLayout(<AppContent {...props} />)}
    </AuthProvider>
  );
}
