'use client';
import React, { useEffect, useState, memo, useCallback } from 'react';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import {
  currentNoteIdAtom,
  getObjectNotesAtom,
  getTreeNotesAtom,
} from '@/state/dashboardAtom';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import { NoteItem } from './NoteItem';
import { SearchModal } from './SearchModal';
import { useParams, useRouter } from 'next/navigation';
import { sessionAtom } from '@/state/noteAtom';
import { AvatarMenu } from './AvatarMenu';
import { useAddNoteToParent } from '@/hooks/addNoteToParent';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Star, Pencil, PlusCircle } from 'lucide-react';
import { NoteAllType, NoteType } from '@/types/note';
import { format } from 'date-fns';
import { TrashBinPopover } from './TrashBinPopover';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';

export const NoteList: React.FC<{ onClickItem?: () => void }> = ({
  onClickItem,
}) => {
  const { noteId } = useParams();
  const router = useRouter();
  const session = useAtomValue(sessionAtom);
  const queryClient = useQueryClient();

  const treeNotes = useAtomValue(getTreeNotesAtom);
  const objectNotes = useAtomValue(getObjectNotesAtom);

  const supabaseClient = useSupabaseBrowser();

  const addNoteToParentMutation = useAddNoteToParent();

  const [currentNote, setCurrentNote] = useAtom(currentNoteIdAtom);
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [favorites, setFavorites] = useState<NoteAllType[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    if (!treeNotes || treeNotes.length === 0) return;

    if (noteId && typeof noteId === 'string') {
      const note = objectNotes[noteId];
      if (note) setCurrentNote(noteId);
    } else {
      setCurrentNote(treeNotes[0].id);
    }
  }, [noteId, treeNotes, setCurrentNote, objectNotes]);

  useEffect(() => {
    if (treeNotes) {
      const favs = treeNotes.filter((note) => note.is_favorite);
      setFavorites(favs);
    }
  }, [treeNotes]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (parentId: string | null) => (event: React.DragEvent) => {
      event.preventDefault();
      const childId = event.dataTransfer.getData('text/plain');

      if (parentId && parentId.toString() === childId) {
        alert('A note cannot be its own parent!');
        return;
      }

      addNoteToParentMutation.mutate({ childId, parentId });
      setDraggedOverId(null);
    },
    [addNoteToParentMutation],
  );

  const addChildNote = useCallback(
    async (parentId: string | null): Promise<void> => {
      if (!session || isAddingNote) return;

      setIsAddingNote(true);
      try {
        const newNote = {
          title: 'Untitled',
          user_id: session.user.id,
          parent_id: parentId,
        };

        const { error, data } = await supabaseClient
          .from('notes')
          .insert(newNote)
          .select('id')
          .single();

        if (error) {
          console.error('Error adding new note:', error);
          return;
        }

        if (data) {
          queryClient.invalidateQueries({ queryKey: ['all_notes'] });
          router.push(`/dashboard/${data.id}`);
        }
      } finally {
        setIsAddingNote(false);
      }
    },
    [session, supabaseClient, queryClient, router, isAddingNote],
  );
  const restoreNote = useCallback(
    async (noteId: string): Promise<void> => {
      if (!session) return;

      try {
        const { error } = await supabaseClient
          .from('notes')
          .update({ deleted_at: null })
          .eq('id', noteId)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error restoring note:', error);
          return;
        }

        queryClient.invalidateQueries({ queryKey: ['all_notes'] });
        queryClient.invalidateQueries({ queryKey: ['trashedNotes'] }); // Add this line
        toast({
          title: 'Note restored',
          description: 'The note has been restored successfully.',
        });
      } catch (error) {
        console.error('Error restoring note:', error);
      }
    },
    [session, supabaseClient, queryClient, toast],
  );
  const deleteNote = useCallback(
    async (noteId: string): Promise<void> => {
      if (!session || isDeletingNote) return;

      setIsDeletingNote(true);
      try {
        const formattedDate = format(new Date(), 'yyyy-MM-dd HH:mm:ssX');
        const { error } = await supabaseClient
          .from('notes')
          .update({ deleted_at: formattedDate })
          .eq('id', noteId)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error soft deleting note:', error);
          return;
        }

        queryClient.invalidateQueries({ queryKey: ['all_notes'] });

        if (noteId === currentNote) {
          const firstAvailableNote = treeNotes?.find(
            (note) => note.id !== noteId && !note.deleted_at,
          );
          if (firstAvailableNote) {
            router.push(`/dashboard/${firstAvailableNote.id}`);
          } else {
            router.push('/dashboard');
          }
        }

        // Show undo toast
        toast({
          title: 'Note moved to trash',
          description: 'Click here to undo',
          action: (
            <ToastAction onClick={() => restoreNote(noteId)} altText="Undo">
              Undo
            </ToastAction>
          ),
        });
      } finally {
        setIsDeletingNote(false);
      }
    },
    [
      session,
      isDeletingNote,
      supabaseClient,
      queryClient,
      currentNote,
      toast,
      treeNotes,
      router,
      restoreNote,
    ],
  );

  const deleteSelectedNotes = useCallback(async () => {
    if (!session || selectedNotes.length === 0) return;

    setIsDeletingNote(true);
    try {
      const formattedDate = format(new Date(), 'yyyy-MM-dd HH:mm:ssX');

      // Filter out notes with children or marked as favorites
      const notesToDelete = selectedNotes.filter((noteId) => {
        const note = objectNotes[noteId];
        return !note.children?.length && !note.is_favorite;
      });

      if (notesToDelete.length === 0) {
        toast({
          title: 'No notes deleted',
          description:
            'Selected notes are either favorites or have children and cannot be deleted.',
        });
        return;
      }

      const { error } = await supabaseClient
        .from('notes')
        .update({ deleted_at: formattedDate })
        .in('id', notesToDelete)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error soft deleting notes:', error);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['all_notes'] });

      if (currentNote && notesToDelete.includes(currentNote)) {
        const firstAvailableNote = treeNotes?.find(
          (note) => !notesToDelete.includes(note.id) && !note.deleted_at,
        );
        if (firstAvailableNote) {
          router.push(`/dashboard/${firstAvailableNote.id}`);
        } else {
          router.push('/dashboard');
        }
      }

      setSelectedNotes([]);

      toast({
        title: `${notesToDelete.length} note(s) moved to trash`,
        description:
          selectedNotes.length !== notesToDelete.length
            ? 'Some notes were not deleted as they are favorites or have children.'
            : undefined,
      });
    } finally {
      setIsDeletingNote(false);
    }
  }, [
    session,
    selectedNotes,
    supabaseClient,
    queryClient,
    currentNote,
    treeNotes,
    router,
    objectNotes,
    toast,
  ]);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedNotes(treeNotes?.map((note) => note.id) || []);
      } else {
        setSelectedNotes([]);
      }
    },
    [treeNotes],
  );

  const handleSelectNote = useCallback((noteId: string, checked: boolean) => {
    setSelectedNotes((prev) =>
      checked ? [...prev, noteId] : prev.filter((id) => id !== noteId),
    );
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
    if (isEditMode) {
      setSelectedNotes([]);
    }
  }, [isEditMode]);

  const toggleFavorite = useCallback(
    async (noteId: string): Promise<void> => {
      if (!session) return;

      try {
        const noteToUpdate = objectNotes[noteId];
        if (!noteToUpdate) return;

        const { error } = await supabaseClient
          .from('notes')
          .update({ is_favorite: !noteToUpdate.is_favorite })
          .eq('id', noteId)
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error toggling favorite:', error);
          return;
        }

        queryClient.invalidateQueries({ queryKey: ['all_notes'] });

        toast({
          title: noteToUpdate.is_favorite
            ? 'Removed from favorites'
            : 'Added to favorites',
          description: `"${noteToUpdate.title}" has been ${noteToUpdate.is_favorite ? 'removed from' : 'added to'} favorites.`,
        });
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    },
    [session, supabaseClient, queryClient, objectNotes, toast],
  );

  const renderNoteItem = useCallback(
    (note: NoteAllType) => (
      <NoteItem
        key={note.id}
        onClickItem={onClickItem}
        note={note}
        isSelected={currentNote === note.id}
        addNoteToParent={({ childId, parentId }) => {
          addNoteToParentMutation.mutate({ childId, parentId });
        }}
        addChildNote={addChildNote}
        isHighlighted={draggedOverId === note.id}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDraggedOverId(note.id);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
          }
          setDraggedOverId(null);
        }}
        deleteNote={deleteNote}
        isEditMode={isEditMode}
        isChecked={selectedNotes.includes(note.id)}
        onCheck={(checked) => handleSelectNote(note.id, checked)}
        isFavorite={note.is_favorite || false}
        toggleFavorite={toggleFavorite}
      >
        {note.children?.map(renderNoteItem)}
      </NoteItem>
    ),
    [
      onClickItem,
      currentNote,
      addChildNote,
      draggedOverId,
      deleteNote,
      addNoteToParentMutation,
      isEditMode,
      selectedNotes,
      handleSelectNote,
      toggleFavorite,
    ],
  );

  const avatarUrl =
    session?.user?.user_metadata?.avatar_url ||
    session?.user?.user_metadata?.picture ||
    '/logo-300.png';
  return (
    <div className="flex h-full flex-col px-2">
      <div className="px-2">
        <div className="flex flex-row justify-between">
          <SearchModal />
          <AvatarMenu avatarUrl={avatarUrl || '/logo-300.png'} />
        </div>
        {favorites.length > 0 && (
          <div className="mb-1">
            <h3 className="mb-1 flex   text-sm font-semibold text-gray-500">
              Favorites
            </h3>
            {favorites.map((note) => renderNoteItem(note))}
          </div>
        )}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center">
            {isEditMode && (
              <Checkbox
                checked={selectedNotes.length === treeNotes?.length}
                onCheckedChange={handleSelectAll}
                className="mr-2"
              />
            )}
            <h3
              className="mr-2 flex-1 text-sm font-semibold text-gray-500"
              draggable
              onDragOver={handleDragOver}
              onDrop={handleDrop(null)}
            >
              All notes
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {isEditMode && selectedNotes.length > 0 && (
              <Button
                onClick={deleteSelectedNotes}
                variant="destructive"
                size="sm"
                disabled={isDeletingNote}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedNotes.length})
              </Button>
            )}
            <Button onClick={toggleEditMode} variant="outline" size="sm">
              {isEditMode ? 'Done' : 'Edit'}
            </Button>
            {!isEditMode && (
              <button
                className="hover:text-primary-foreground-dark flex-shrink-0 text-2xl font-bold transition-colors duration-200 disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  addChildNote(null);
                }}
                disabled={isAddingNote}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-0">
        <div>{treeNotes?.map((note) => renderNoteItem(note))}</div>
      </div>
      <div className="border-t p-0">
        <TrashBinPopover restoreNote={restoreNote} onClickItem={onClickItem} />
      </div>
    </div>
  );
};
