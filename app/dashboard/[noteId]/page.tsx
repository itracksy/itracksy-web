import { NoteEdit } from '../components/NoteEdit';

export default function NotePage({ params }: { params: { noteId: string } }) {
  return (
    <div className="col-span-4 h-screen overflow-y-auto px-4 md:col-span-4">
      <div className="max-w-2xl">
        <NoteEdit currentId={params.noteId} />
      </div>
    </div>
  );
}
