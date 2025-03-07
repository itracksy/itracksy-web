'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const createNote = async (formData: FormData) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const { data: note, error: createNoteError } = await supabase
    .from('notes')
    .insert({ title, content, user_id: data.user.id })
    .select('id');

  if (createNoteError) {
    console.error('Failed to create note');
    return;
  }
  revalidatePath('/dashboard');
};

export const deleteNote = async (noteId: number) => {
  const supabase = createClient();

  const { error } = await supabase.from('notes').delete().eq('id', noteId);

  if (error) {
    console.error('Failed to delete note');
    return;
  }
  revalidatePath('/dashboard');
};

export const fetchNotes = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch notes');
  }

  return data;
};
