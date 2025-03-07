'use client';
import { formatDistance } from 'date-fns';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef, useMemo } from 'react';

import LoadingOverlay from '@/components/loading-overlay';

import {
  allSearchNotesQueryFn,
  searchNotesQueryFn,
} from '@/app/services/notes';

import { useAtomValue } from 'jotai';
import { sessionAtom } from '@/state/noteAtom';

export const SearchInput: React.FunctionComponent<{
  searchQuery: string;
  onItemClick: (noteId: string) => void;
}> = ({ searchQuery, onItemClick }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const supabaseClient = useSupabaseBrowser();
  const session = useAtomValue(sessionAtom);
  const allNotesQuery = useQuery({
    queryKey: ['allSearchNotesQueryFn'],
    queryFn: allSearchNotesQueryFn(supabaseClient, session?.user.id),
    enabled: !!session && !!session.user.id,
  });

  const searchNotesQuery = useQuery({
    queryKey: ['notes', searchQuery],
    queryFn: searchNotesQueryFn(supabaseClient, searchQuery),
    enabled: !!searchQuery && searchQuery.length > 0,
  });

  const filterNotes = useMemo(
    () =>
      (searchQuery.length > 0 ? searchNotesQuery.data : allNotesQuery.data) ??
      [],
    [searchQuery.length, searchNotesQuery.data, allNotesQuery.data],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filterNotes.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        onItemClick(filterNotes[selectedIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filterNotes, selectedIndex, onItemClick]);

  return (
    <div className="dark:border-gray-700">
      <div className="px-4 py-2">
        <div className="py-1" ref={listRef}>
          {filterNotes.length > 0 && (
            <div className="block">
              {filterNotes.map((note, index) => (
                <div
                  key={note.id}
                  className={`flex flex-col p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 ${
                    index === selectedIndex
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : ''
                  }`}
                  onClick={() => {
                    onItemClick(note.id);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  role="option"
                  aria-selected={index === selectedIndex}
                  tabIndex={0}
                >
                  <span className="line-clamp-1 text-sm">{note.title}</span>
                  <div className=" flex flex-row">
                    <span className="line-clamp-1 flex-1 text-xs text-gray-500">
                      {note.content}
                    </span>

                    <span className="text-xs text-gray-700 text-muted-foreground">
                      {formatDistance(note.updated_at, new Date(), {
                        addSuffix: false,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <LoadingOverlay
        loading={searchNotesQuery.isLoading || allNotesQuery.isLoading}
      />
    </div>
  );
};
