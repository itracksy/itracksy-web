'use client';

import { useSupabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import { sessionAtom } from '@/state/noteAtom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { DataProvider } from './DataProvider';

export const ReactQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [, setSession] = useAtom(sessionAtom);
  const router = useRouter();
  const supabaseClient = useSupabaseBrowser();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && isFirstLoad && window.location.pathname === '/') {
        router.push('/dashboard');
        setIsFirstLoad(false);
      }
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && isFirstLoad && window.location.pathname === '/') {
        router.push('/dashboard');
        setIsFirstLoad(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient, setSession, router, isFirstLoad]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>{children}</DataProvider>
    </QueryClientProvider>
  );
};
