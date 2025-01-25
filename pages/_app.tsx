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
import { useEffect } from 'react';
import { formFields, components } from './config/auth-config';

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
    if (router.pathname.startsWith('/admin') && !isAdmin) {
      router.push('/');
    }
  }, [router.pathname, isAdmin, router]);

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
    <Authenticator formFields={formFields} components={components}>
      {({ signOut, user }) => {
        // When we get here, we know the user is authenticated
        // Trigger a check of the auth state
        checkAuth().then(() => {
          // After checking auth, redirect to about page
          router.push('/about');
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