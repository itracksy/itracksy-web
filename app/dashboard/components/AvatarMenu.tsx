'use client';

import { useSupabaseBrowser } from '@/lib/supabase/client';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaChrome, FaEdge } from 'react-icons/fa';
import { User, LogOut, BookOpen, Sun, Moon, MessageCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { resetUser } from '@/lib/posthog';

export const AvatarMenu: React.FunctionComponent<{ avatarUrl: string }> = ({
  avatarUrl,
}) => {
  const supabaseClient = useSupabaseBrowser();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [browserType, setBrowserType] = useState<'chrome' | 'edge' | 'other'>(
    'other',
  );
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [extensionVersion, setExtensionVersion] = useState<string | null>(null);

  useEffect(() => {
    // Detect browser
    const isEdge = /Edg/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent) && !isEdge;

    if (isEdge) {
      setBrowserType('edge');
    } else if (isChrome) {
      setBrowserType('chrome');

      // if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      //   try {
      //     chrome.runtime.sendMessage('legchjgekeapjfbmnijajohbkbnpafoc', {
      //       message: 'checkExtensionVersion',
      //     });
      //   } catch (error) {
      //     console.error('Error checking extension version:', error);
      //   }
      // }
    }
  }, []);

  const getExtensionLink = () => {
    switch (browserType) {
      case 'chrome':
        return 'https://chromewebstore.google.com/detail/bubbybeep-your-ai-explora/cbibgdcbkoikdkeahemkjkpacmgicaco';
      case 'edge':
        return 'https://microsoftedge.microsoft.com/addons/detail/okjbfkonbgmfhcekhdpbodcfadofdefg';
      default:
        return '#';
    }
  };

  const openExtension = () => {
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage('legchjgekeapjfbmnijajohbkbnpafoc', {
        message: 'openMainApp',
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Image
          alt="Avatar"
          className="rounded-full"
          height="32"
          src={avatarUrl}
          style={{
            aspectRatio: '32/32',
            objectFit: 'cover',
          }}
          width="32"
        />
        <span className="sr-only">Toggle user menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/account')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/blog')}>
          <BookOpen className="mr-2 h-4 w-4" />
          How to use Bubbybeep
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/feedback')}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Feedback
        </DropdownMenuItem>

        {browserType === 'chrome' &&
          (isExtensionInstalled ? (
            <DropdownMenuItem onClick={openExtension}>
              <FaChrome className="mr-2 h-4 w-4" />
              Open Extension {extensionVersion && `(v${extensionVersion})`}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => window.open(getExtensionLink(), '_blank')}
            >
              <FaChrome className="mr-2 h-4 w-4" />
              Install Extension
            </DropdownMenuItem>
          ))}

        {browserType === 'edge' && (
          <DropdownMenuItem
            onClick={() => window.open(getExtensionLink(), '_blank')}
          >
            <FaEdge className="mr-2 h-4 w-4" />
            Install Extension
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              {theme === 'dark' ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : (
                <Sun className="mr-2 h-4 w-4" />
              )}
              {theme === 'dark' ? 'Dark' : 'Light'} Mode
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            // Reset PostHog user identification
            resetUser();
            // Sign out from Supabase
            await supabaseClient.auth.signOut();
            router.push('/login');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
