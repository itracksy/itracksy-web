import React, { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getTrashedNotes } from '@/app/services/notes';
import { useAtomValue } from 'jotai';
import { sessionAtom } from '@/state/noteAtom';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { MyTooltip } from '@/components/tooltip';

interface TrashBinPopoverContentProps {
  restoreNote: (noteId: string) => Promise<void>;
  onClickItem?: (noteId: string) => void;
}

export const TrashBinPopoverContent: React.FC<TrashBinPopoverContentProps> = ({
  restoreNote,
  onClickItem,
}) => {
  //query trash item from supabase

  const session = useAtomValue(sessionAtom);

  const supabaseClient = useSupabaseBrowser();
  const {
    data: trashedNotes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['trashedNotes'],
    queryFn: getTrashedNotes(supabaseClient, session?.user.id),
    enabled: !!session && !!session.user.id,
  });
  useEffect(() => {
    refetch();
  }, [refetch]);
  return (
    <div className="space-y-2 bg-gray-100 p-2 dark:bg-gray-800">
      <h4 className="text-sm font-semibold text-gray-500">Trashed Notes</h4>
      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      ) : trashedNotes?.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No trashed notes
        </p>
      ) : (
        <ul className="max-h-96 space-y-2 overflow-y-auto">
          {trashedNotes?.map((note) => (
            <li key={note.id} className="flex  items-center justify-between ">
              <Link
                href={`/dashboard/${note.id}`}
                className="w-40 min-w-0 flex-grow truncate py-1 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => onClickItem && onClickItem(note.id)}
              >
                <span className="block truncate">{note.title}</span>
              </Link>
              <MyTooltip content="Restore note">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    restoreNote(note.id);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Restore note"
                >
                  <ArrowUturnLeftIcon className="h-5 w-5" />
                </Button>
              </MyTooltip>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
