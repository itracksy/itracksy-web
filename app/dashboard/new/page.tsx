'use client';
import { Markdown } from 'tiptap-markdown';
import { useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { useAtom } from 'jotai';

import { Editor } from 'novel';

export default function NotePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  if (!currentNote) return null;
  return (
    <div
      className="col-span-4 overflow-y-auto p-4 md:col-span-4"
      style={{ maxHeight: 'calc(100vh - 4rem)' }}
    >
      <Input
        ref={inputRef}
        data-error="false"
        className="w-full border-none p-0 text-xl ring-0 placeholder:text-white/30 placeholder:transition placeholder:duration-500 focus-visible:ring-0 data-[error=true]:placeholder:text-red-400"
        placeholder="Title of the note"
        value={currentNote.title ?? ''}
        disabled={loading}
        onChange={(e) =>
          setCurrentNote({ ...currentNote, title: e.target.value })
        }
      />
      <Editor
        disableLocalStorage
        defaultValue={currentNote?.content || ''}
        onUpdate={(editor) => {
          if (!editor || !currentNote) return;
          const content: string = editor.storage.markdown.getMarkdown();
          setCurrentNote({
            ...currentNote,
            content,
          });
        }}
        extensions={[Markdown]}
        className="novel-editor bg-rgray-4 border-rgray-7 w-[50vw] overflow-y-auto rounded-lg border [&>div>div]:p-5"
      />
    </div>
  );
}
