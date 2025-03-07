import { Suspense } from 'react';
import { NoteList } from './components/NoteList';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      }
    >
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="grid h-screen grid-cols-1 gap-4  md:grid-cols-4 lg:grid-cols-6">
          <div className="sticky top-0 hidden h-full overflow-hidden overflow-y-auto border-r bg-gray-100 dark:bg-gray-800 md:col-span-2 md:block">
            <NoteList />
          </div>

          <div className="overflow-y-auto md:col-span-2 lg:col-span-4">
            {children}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
