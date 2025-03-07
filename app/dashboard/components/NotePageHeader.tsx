'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Download } from 'lucide-react';
import {
  getCurrentNotePathAtom,
  getObjectNotesAtom,
} from '@/state/dashboardAtom';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { groupItems } from '@/utils/array';
import { ShareDialog } from './ShareDialog';
import { MobileNav } from './MobileNav';
import { ExternalLink, Star, Trash, Undo } from 'lucide-react';
import { NoteType } from '@/types/note';

// Add this prop to the component's props
interface NotePageHeaderProps {
  sourceUrl: string | null;
  onDelete: () => void;
  noteId: string;
  isPublic: boolean;
  onTogglePublic: (isPublic: boolean) => Promise<void>;
  noteTitle: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isDeleted: boolean;
  onRestore: () => void;
  onConvertToKindle: () => void;
  note: NoteType;
}

const NotePageHeader: React.FC<NotePageHeaderProps> = ({
  sourceUrl,
  onDelete,
  noteId,
  isPublic,
  onTogglePublic,
  noteTitle,
  isFavorite,
  onToggleFavorite,
  isDeleted,
  onRestore,
  onConvertToKindle,
  note,
}) => {
  const router = useRouter();
  const path = useAtomValue(getCurrentNotePathAtom);
  const groupedPath = groupItems(path, 1, path.length - 2);
  const objectNotes = useAtomValue(getObjectNotesAtom);
  const supabase = useSupabaseBrowser();

  const handleClone = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to clone this note.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: originalNote, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (fetchError) throw fetchError;

      const { data: clonedNote, error: cloneError } = await supabase
        .from('notes')
        .insert({
          title: `Clone of ${originalNote.title}`,
          content: originalNote.content,
          summary: originalNote.summary,
          type: originalNote.type,
          source_url: originalNote.source_url,
          user_id: user.id,
        })
        .select()
        .single();

      if (cloneError) throw cloneError;

      toast({
        title: 'Note cloned',
        description: 'The note has been successfully cloned.',
      });

      router.push(`/dashboard/${clonedNote.id}`);
    } catch (error) {
      console.error('Error cloning note:', error);
      toast({
        title: 'Error',
        description: 'Failed to clone the note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header
      className="sticky top-0 z-10 flex w-full items-center gap-4 bg-primary-foreground shadow-md"
      style={{ height: '3rem' }}
    >
      <div className="flex h-full flex-1 items-center gap-4 px-2">
        <MobileNav />

        <Breadcrumb className="flex-1">
          <BreadcrumbList>
            {groupedPath.map((p, i) => {
              if (typeof p === 'string') {
                const note = objectNotes[p];
                if (!note) {
                  return null;
                }
                return (
                  <BreadcrumbItem key={p}>
                    <BreadcrumbLink
                      className="line-clamp-1 cursor-pointer break-words"
                      onClick={() => {
                        router.push(`/dashboard/${p}`);
                      }}
                    >
                      {note.title}
                    </BreadcrumbLink>
                    {i !== path.length - 1 && <BreadcrumbSeparator />}
                  </BreadcrumbItem>
                );
              }
              return (
                <BreadcrumbItem key={'groupedPath'}>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      <BreadcrumbEllipsis className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {p.map((noteId) => {
                        const note = objectNotes[noteId];
                        return (
                          <DropdownMenuItem
                            key={noteId}
                            onClick={() => {
                              router.push(`/dashboard/${noteId}`);
                            }}
                            className="cursor-pointer"
                          >
                            {note.title}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <BreadcrumbSeparator />
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <nav className=" flex items-center justify-center gap-4">
          <ShareDialog
            noteId={noteId}
            isPublic={isPublic}
            onTogglePublic={onTogglePublic}
            noteTitle={noteTitle}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sourceUrl && (
                <DropdownMenuItem
                  onClick={() => {
                    window.open(sourceUrl, '_blank');
                  }}
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Go to original page
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={onToggleFavorite}
                className="cursor-pointer"
              >
                <Star className="mr-2 h-4 w-4" />
                {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleClone}
                className="cursor-pointer"
              >
                <Copy className="mr-2 h-4 w-4" />
                Clone note
              </DropdownMenuItem>
              {isDeleted && (
                <DropdownMenuItem
                  onClick={onRestore}
                  className="cursor-pointer"
                >
                  <Undo className="mr-2 h-4 w-4" />
                  Restore note
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="cursor-pointer text-red-500 hover:text-red-700"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onConvertToKindle}
                className="cursor-pointer"
              >
                <Download className="mr-2 h-4 w-4" />
                Read on e-readers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};

export default NotePageHeader;
