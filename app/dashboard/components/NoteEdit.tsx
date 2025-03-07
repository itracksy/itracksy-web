'use client';
import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';

import { useAtomValue } from 'jotai';
import {
  getCurrentNotePathAtom,
  getNoteFromTreeByIdAtom,
} from '@/state/dashboardAtom';

import { debounce } from '@/utils/debounce';
import { NoteType } from '@/types/note';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteNoteMutationFn,
  getDetailNoteQueryFn,
} from '@/app/services/notes';
import NotePageHeader from './NotePageHeader';
import { useRouter } from 'next/navigation';

import { AutoResizeInput } from '@/components/AutoResizeInput';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { convertToHtmlFile } from '@/lib/convertToHtmlFile';

import { NoteView } from './NoteView';

export const NoteEdit: React.FunctionComponent<{
  currentId: string | null;
}> = ({ currentId }) => {
  const [currentNote, setCurrentNote] = useState<NoteType>();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const currentPath = useAtomValue(getCurrentNotePathAtom);
  const supabaseClient = useSupabaseBrowser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  const note = useMemo(
    () => getNoteFromTreeByIdAtom(currentId ?? ''),
    [currentId],
  );
  const noteTreeValue = useAtomValue(note);

  const togglePublicStatus = async (isPublic: boolean) => {
    if (!currentId) {
      throw new Error('No current note id');
    }
    await supabaseClient
      .from('notes')
      .update({ is_public: isPublic })
      .eq('id', currentId)
      .then(({ error }) => {
        if (error) throw error;
        queryClient.invalidateQueries({
          queryKey: ['getDetailNoteQueryFn', currentId],
        });
      });
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['getDetailNoteQueryFn', currentId],
    queryFn: getDetailNoteQueryFn(supabaseClient, currentId ?? undefined),
    enabled: !!currentId,
  });

  const { mutate } = useMutation({
    mutationFn: deleteNoteMutationFn(supabaseClient),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['all_notes'] });
      if (currentPath.length > 1) {
        const id = currentPath[currentPath.length - 2];
        router.push(`/dashboard/${id}`);
      } else {
        router.push(`/dashboard`);
      }
    },
  });

  useEffect(() => {
    setCurrentNote(data ?? undefined);
    setIsInitialLoad(false);
  }, [data]);

  useEffect(() => {
    if (!isInitialLoad && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [isInitialLoad]);

  useEffect(() => {
    if (isError) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isError, router]);

  const debouncedUpdateNote = useMemo(
    () =>
      debounce((note: NoteType, isTitle: boolean = false) => {
        supabaseClient
          .from('notes')
          .update({
            title: note.title,
            content: note.content,
            summary: note.summary,
          })
          .eq('id', note.id)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating note:', error);
              return;
            }
            queryClient.invalidateQueries({
              queryKey: ['getDetailNoteQueryFn', currentId],
            });
            if (isTitle) {
              queryClient.invalidateQueries({ queryKey: ['all_notes'] });
            }
          });
        setCurrentNote(note);
      }, 300),
    [queryClient, currentId, supabaseClient],
  );

  const handleTitleChange = useCallback(
    (value: string) =>
      currentNote &&
      debouncedUpdateNote({ ...currentNote, title: value }, true),
    [currentNote, debouncedUpdateNote],
  );

  const handleSummaryUpdate = useCallback(
    (editor: any) => {
      if (!editor) return;
      const summary: string = editor.storage.markdown.getMarkdown();
      currentNote &&
        debouncedUpdateNote({
          ...currentNote,
          summary,
        });
    },
    [currentNote, debouncedUpdateNote],
  );

  const handleContentUpdate = useCallback(
    (editor: any) => {
      if (!editor) return;
      const content: string = editor.storage.markdown.getMarkdown();
      currentNote &&
        debouncedUpdateNote({
          ...currentNote,
          content,
        });
    },
    [currentNote, debouncedUpdateNote],
  );

  const handleRawMarkdownChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const content = event.target.value;
      currentNote &&
        debouncedUpdateNote({
          ...currentNote,
          content,
        });
    },
    [currentNote, debouncedUpdateNote],
  );

  const getYouTubeVideoId = (url: string | null) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const toggleFavorite = async () => {
    if (!currentNote) return;

    const newFavoriteStatus = !currentNote.is_favorite;

    try {
      await supabaseClient
        .from('notes')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', currentNote.id);

      setCurrentNote({ ...currentNote, is_favorite: newFavoriteStatus });
      queryClient.invalidateQueries({ queryKey: ['all_notes'] });

      toast({
        title: newFavoriteStatus
          ? 'Added to favorites'
          : 'Removed from favorites',
        description: `"${currentNote.title}" has been ${newFavoriteStatus ? 'added to' : 'removed from'} your favorites.`,
      });
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorite status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const restoreNote = async () => {
    if (!currentNote) return;

    try {
      await supabaseClient
        .from('notes')
        .update({ deleted_at: null })
        .eq('id', currentNote.id);

      setCurrentNote({ ...currentNote, deleted_at: null });
      queryClient.invalidateQueries({ queryKey: ['all_notes'] });

      toast({
        title: 'Note restored',
        description: `"${currentNote.title}" has been restored.`,
      });
    } catch (error) {
      console.error('Error restoring note:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore the note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleConvertToKindle = useCallback(async () => {
    if (!noteTreeValue) return;

    await convertToHtmlFile(noteTreeValue, supabaseClient);

    toast({
      title: 'Kindle file created',
      description: `"${noteTreeValue.title}" has been converted to a Kindle-compatible format.`,
    });
  }, [noteTreeValue]);

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load note. Redirecting to dashboard...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentNote || isLoading || !currentId) return <div>Loading...</div>;

  const videoId =
    currentNote.type === 'summary-youtube-videos'
      ? getYouTubeVideoId(currentNote.source_url)
      : null;

  return (
    <div key={currentId} ref={scrollRef}>
      <div className="sticky top-0 z-10 bg-background pb-2">
        <div className="flex items-center justify-between">
          <NotePageHeader
            note={currentNote}
            sourceUrl={currentNote?.source_url}
            onDelete={() => {
              mutate(currentId);
            }}
            noteId={currentId}
            isPublic={currentNote?.is_public || false}
            onTogglePublic={togglePublicStatus}
            noteTitle={currentNote?.title ?? 'Untitled Note'}
            isFavorite={currentNote?.is_favorite || false}
            onToggleFavorite={toggleFavorite}
            isDeleted={!!currentNote?.deleted_at}
            onRestore={restoreNote}
            onConvertToKindle={handleConvertToKindle}
          />
        </div>
      </div>

      {
        <>
          <AutoResizeInput
            key={`title-${currentNote.id}`}
            defaultValue={currentNote.title ?? ''}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            className="text-xl font-bold"
          />
          {currentNote && (
            <NoteView
              note={currentNote}
              handleContentUpdate={handleContentUpdate}
              handleSummaryUpdate={handleSummaryUpdate}
            />
          )}
        </>
      }
    </div>
  );
};
