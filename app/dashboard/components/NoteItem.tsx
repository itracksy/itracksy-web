import React, { useState, useCallback, memo } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  MoreHorizontal,
  Trash,
  PlusCircle,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NoteAllType } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface NoteItemProps {
  note: NoteAllType;
  isSelected?: boolean;
  addNoteToParent: (params: {
    childId: string;
    parentId: string | null;
  }) => void;
  addChildNote: (parentId: string | null) => Promise<void>;
  isHighlighted: boolean;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  deleteNote: (noteId: string) => Promise<void>;
  children?: React.ReactNode;
  onClickItem?: () => void;
  isEditMode: boolean;
  isChecked: boolean;
  onCheck: (checked: boolean) => void;
  isFavorite: boolean;
  toggleFavorite: (noteId: string) => Promise<void>;
}

export const NoteItem: React.FC<NoteItemProps> = memo(
  ({
    note,
    isSelected,
    addNoteToParent,
    addChildNote,
    isHighlighted,
    onDragOver,
    onDragLeave,
    deleteNote,
    children,
    onClickItem,
    isEditMode,
    isChecked,
    onCheck,
    isFavorite,
    toggleFavorite,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAddingChild, setIsAddingChild] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteNote = useCallback(async () => {
      setIsDeleting(true);
      try {
        await deleteNote(note.id);
      } finally {
        setIsDeleting(false);
      }
    }, [deleteNote, note.id]);

    const handleAddChildNote = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsAddingChild(true);
        try {
          await addChildNote(note.id);
        } finally {
          setIsAddingChild(false);
        }
      },
      [addChildNote, note.id],
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        const childId = e.dataTransfer.getData('text/plain');
        addNoteToParent({ childId, parentId: note.id });
      },
      [addNoteToParent, note.id],
    );

    const handleToggleFavorite = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        await toggleFavorite(note.id);
      },
      [toggleFavorite, note.id],
    );

    const hasChildren = React.Children.count(children) > 0;

    return (
      <>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div
            className={cn(
              'group mb-1 flex items-center justify-between rounded-lg transition-all duration-200',
              'hover:bg-gray-100 hover:shadow-md dark:hover:bg-gray-700',
              isSelected
                ? 'bg-gray-200 dark:bg-gray-600'
                : isHighlighted
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'bg-white dark:bg-gray-800',
            )}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', note.id)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex min-w-0 flex-grow items-center space-x-1">
              {isEditMode && (
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={onCheck}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-4"
                />
              )}
              {hasChildren ? (
                <CollapsibleTrigger asChild>
                  <button className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isOpen ? 'rotate-90' : '',
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
              ) : (
                <div className="h-4 w-4 flex-shrink-0" />
              )}
              <Link
                href={`/dashboard/${note.id}`}
                className={cn(
                  'w-40 min-w-0 flex-grow truncate py-1 text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400',
                  isSelected &&
                    'group-hover:text-blue-800 dark:text-blue-400 dark:group-hover:text-blue-200',
                )}
                onClick={onClickItem}
              >
                <span className="block truncate">{note.title}</span>
              </Link>
            </div>
            <div className="flex flex-shrink-0 items-center space-x-1">
              <Button
                onClick={handleAddChildNote}
                disabled={isAddingChild}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={handleToggleFavorite}
                    className="cursor-pointer"
                  >
                    <Star
                      className={cn(
                        'mr-2 h-4 w-4',
                        isFavorite
                          ? 'fill-current text-yellow-500'
                          : 'text-gray-500',
                      )}
                    />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote();
                    }}
                    className="cursor-pointer"
                    disabled={isDeleting}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CollapsibleContent className="ml-6">
            {children}
            {!hasChildren && (
              <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                No children
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </>
    );
  },
);

NoteItem.displayName = 'NoteItem';
