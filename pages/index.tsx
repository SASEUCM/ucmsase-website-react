import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/about');
  }, [router]);

  // Return null or a loading state while redirecting
  return null;
}