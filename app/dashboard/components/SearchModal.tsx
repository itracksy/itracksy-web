'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRef } from 'react';

import { useEffect, useState } from 'react';
import { SearchIcon } from './SearchIcon';
import { SearchInput } from './SearchInput';
import { debounce } from '@/utils/debounce';
import { DeleteIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { currentNoteIdAtom } from '@/state/dashboardAtom';

export const SearchModal: React.FunctionComponent = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [, setCurrentNote] = useAtom(currentNoteIdAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  // Create a debounced version of the handler that updates searchTerm
  const debouncedSetSearchTerm = debounce(setSearchQuery, 300);

  useEffect(() => {
    // Update searchTerm after a debounce when inputValue changes

    debouncedSetSearchTerm(inputValue);
  }, [inputValue, debouncedSetSearchTerm]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (open) {
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }}
    >
      <DialogTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          aria-label="Open search"
          className="sticky flex flex-1 cursor-pointer items-center gap-2 py-4 text-gray-500 transition duration-200 ease-in-out hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setOpen(true);
            }
          }}
        >
          <SearchIcon className="h-4 w-4" aria-hidden="true" />
          Search
        </div>
      </DialogTrigger>
      <DialogContent className="flex w-full max-w-5xl items-center justify-center border-0 bg-transparent">
        <div
          className="h-[80vh] w-full overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800"
          role="dialog"
          aria-label="Search notes"
        >
          <div className="flex items-center border-b p-4 px-4 dark:border-gray-700">
            <SearchIcon
              className="mr-3 h-4 w-4 text-muted-foreground dark:text-gray-400"
              aria-hidden="true"
            />
            <Input
              ref={inputRef}
              className="flex-1 bg-white placeholder-gray-500  focus-visible:ring-transparent focus-visible:ring-offset-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              onChange={handleSearchInputChange}
              value={inputValue}
              placeholder="Search"
              type="text"
              aria-label="Search notes"
            />
            {inputValue && (
              <div>
                <Button
                  className="ml-2"
                  variant="ghost"
                  onClick={() => setInputValue('')}
                  aria-label="Clear search"
                >
                  <DeleteIcon
                    className="h-4 w-4 text-muted-foreground dark:text-gray-400"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            )}
          </div>
          <div className="h-full overflow-y-auto py-4">
            <SearchInput
              searchQuery={searchQuery}
              onItemClick={(noteId) => {
                setCurrentNote(noteId);
                router.push(`/dashboard/${noteId}`);
                setOpen(false);
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
