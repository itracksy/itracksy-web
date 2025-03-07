'use client';

import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useRouter, useParams } from 'next/navigation';
import { currentNoteIdAtom, getTreeNotesAtom } from '@/state/dashboardAtom';
import { MobileNav } from './components/MobileNav';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { sessionAtom } from '@/state/noteAtom';

export default function Dashboard() {
  const [, setCurrentNoteId] = useAtom(currentNoteIdAtom);
  const treeNotes = useAtomValue(getTreeNotesAtom);
  const router = useRouter();
  const params = useParams();
  const supabaseClient = useSupabaseBrowser();
  const queryClient = useQueryClient();
  const session = useAtomValue(sessionAtom);

  useEffect(() => {
    if (!params.noteId && treeNotes && treeNotes.length > 0) {
      const firstNoteId = treeNotes[0].id;
      setCurrentNoteId(firstNoteId);
      router.push(`/dashboard/${firstNoteId}`);
    }
  }, [params.noteId, treeNotes, setCurrentNoteId, router]);

  const createNewNote = async () => {
    if (!session) return;

    try {
      const newNote = {
        title: 'Untitled',
        user_id: session.user.id,
        parent_id: null,
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
    } catch (error) {
      console.error('Error creating new note:', error);
    }
  };

  return (
    <div className="flex h-full justify-center overflow-y-auto">
      <MobileNav />
      <div className="w-full max-w-2xl px-4 py-8">
        <div className="flex h-full flex-col items-center justify-center">
          {treeNotes && treeNotes.length > 0 ? (
            <p className="text-lg text-gray-500">Loading note...</p>
          ) : (
            <>
              <p className="mb-4 text-lg text-gray-500">
                No notes yet. Create your first note!
              </p>
              <Button onClick={createNewNote}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Note
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
