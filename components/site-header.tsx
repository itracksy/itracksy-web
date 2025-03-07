import { cn } from '@/lib/utils';
import Link from 'next/link';
import { buttonVariants } from './ui/button';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { InstallButton } from './install-button';

import Image from 'next/image';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface SiteHeaderProps {
  isLoginPage?: boolean;
}

export async function SiteHeader({ isLoginPage = false }: SiteHeaderProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userAvatar = user?.user_metadata?.avatar_url || null;

  return (
    <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <MainNav />
        <div className="flex items-center space-x-4">
          <div className="mr-8 hidden sm:block">
            <InstallButton isAutoDetect={true} />
          </div>

          {user ? (
            <Link href="/dashboard">
              <div
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'items-center space-x-2 sm:inline-flex',
                )}
              >
                <span className="hidden sm:inline">Dashboard</span>
                {userAvatar && (
                  <Image
                    src={userAvatar}
                    alt="User Avatar"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
              </div>
            </Link>
          ) : (
            !isLoginPage && (
              <Link href="/login">
                <div
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'inline-flex',
                  )}
                >
                  <span>Log In</span>
                </div>
              </Link>
            )
          )}
          <MobileNav isAuthenticated={!!user} userAvatar={userAvatar} />
        </div>
      </div>
    </header>
  );
}
