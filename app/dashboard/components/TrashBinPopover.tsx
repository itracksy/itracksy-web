import React, { useState, useCallback, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const TrashBinPopoverContent = dynamic(
  () =>
    import('./TrashBinPopoverContent').then(
      (mod) => mod.TrashBinPopoverContent,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
);

interface TrashBinPopoverProps {
  restoreNote: (noteId: string) => Promise<void>;
  onClickItem?: () => void;
}

// Custom hook for media query
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
};

export const TrashBinPopover: React.FC<TrashBinPopoverProps> = ({
  restoreNote,
  onClickItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open && onClickItem) {
        onClickItem();
      }
    },
    [onClickItem],
  );

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsOpen(true)}
        >
          <span className="flex items-center">
            <Trash2 className="mr-2 h-4 w-4" /> Trash
          </span>
        </Button>
      </PopoverTrigger>
      {isOpen && (
        <PopoverContent
          className={isMobile ? 'h-screen w-screen pt-12' : 'w-80'}
          side={isMobile ? 'bottom' : 'right'}
          align={isMobile ? 'center' : 'start'}
        >
          <TrashBinPopoverContent
            restoreNote={restoreNote}
            onClickItem={() => setIsOpen(false)}
          />
        </PopoverContent>
      )}
    </Popover>
  );
};
