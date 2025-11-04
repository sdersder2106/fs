'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-blue-600 rounded-lg">
          <span className="text-3xl font-bold text-white">B</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Base44</h1>
        <p className="text-gray-600">Penetration Testing Management Platform</p>
        <div className="mt-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-500">Redirection en cours...</p>
        </div>
      </div>
    </div>
  );
}