'use client';
import React, { ReactNode, useState, useRef, useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { NoteType } from '@/types/note';
import { TextToSpeech } from '@/app/dashboard/components/TextToSpeech';
import { useAtomValue } from 'jotai';
import { fontAtom, speedAtom } from '@/state/fastReadSettings';
import { CloneNoteButton } from '@/components/CloneNoteButton';
import nlp from 'compromise';
import { Button } from '@/components/ui/button';
import {
  RabbitIcon,
  TurtleIcon,
  PlayIcon,
  PauseIcon,
  XIcon,
  Pencil,
  Eye,
  FileEdit,
  FileText,
} from 'lucide-react';
import { ReadingSettingDialog } from '@/components/ReadingSettingDialog';
import { Editor } from 'novel';
import { isPausedAudioAtom, isPlayingAudioAtom } from '@/state/textToSpeech';
import { Markdown } from 'tiptap-markdown';

let currentSentence = 0;

let key = 0;
const YouTubeEmbed: React.FC<{ videoId: string }> = ({ videoId }) => (
  <div className="relative mb-4 w-full pb-[56.25%]">
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="absolute left-0 top-0 h-full w-full"
    />
  </div>
);

export const NoteView: React.FC<{
  note: NoteType;
  isReadingMode?: boolean;
  onClose?: () => void;
  handleContentUpdate: (editor: any) => void;
  handleSummaryUpdate: (editor: any) => void;
}> = ({
  note,
  isReadingMode = false,
  onClose,
  handleContentUpdate,
  handleSummaryUpdate,
}) => {
  const isPausedAudio = useAtomValue(isPausedAudioAtom);
  const isPlayingAudio = useAtomValue(isPlayingAudioAtom);
  const speed = useAtomValue(speedAtom);
  const font = useAtomValue(fontAtom);

  const fontOptions: Record<string, string> = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  const getYouTubeVideoId = (url: string | null) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId =
    note.type === 'summary-youtube-videos'
      ? getYouTubeVideoId(note.source_url)
      : null;

  const [isReading, setIsReading] = useState(false);
  const [isPausedReading, setIsPausedReading] = useState(false);
  const [isEditing, setIsEditing] = useState(
    !note.content || (note.content && note.content.length === 0),
  );
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleReadingProgress = () => {
    if (note.content) {
      sentenceRefs.current = Array.from(
        document.querySelectorAll<HTMLSpanElement>('.sentence'),
      );
      const maxIndex = sentenceRefs.current.length - 1;
      const currentSentenceElement = sentenceRefs.current[currentSentence];
      if (currentSentence <= maxIndex && currentSentenceElement) {
        const currentSentenceText = currentSentenceElement?.textContent || '';
        currentSentenceElement?.classList.add('highlighted-sentence');

        const offset = 200; // pixels
        const rect = currentSentenceElement.getBoundingClientRect();
        const isOutOfViewport =
          rect.bottom < offset || rect.top > window.innerHeight - offset;

        if (isOutOfViewport) {
          currentSentenceElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }

        const wordCount = currentSentenceText.trim().split(/\s+/).length;
        const baseDelay = Math.max(wordCount * 200, 500);
        const adjustedDelay = baseDelay / (speed / 250);

        timeoutRef.current = setTimeout(() => {
          currentSentenceElement?.classList.remove('highlighted-sentence');
          currentSentence++;
          handleReadingProgress();
        }, adjustedDelay);

        return () => timeoutRef.current && clearTimeout(timeoutRef.current);
      } else {
        currentSentence = 0;
        setIsReading(false);
        return;
      }
    }
  };

  const processSentences = (text?: ReactNode): ReactNode[] => {
    key++;
    if (typeof text !== 'string') {
      if (Array.isArray(text)) {
        return text.map((item) => {
          if (typeof item === 'string') {
            return processSentences(item);
          }
          return (
            <span key={`non-text-${key}`} className="sentence">
              {item}
            </span>
          );
        });
      }
      return [
        <span key={`single-node-${key}`} className="sentence">
          {text}
        </span>,
      ];
    }

    const doc = nlp(text);
    const sentences = doc
      .sentences()
      .out('array')
      .filter((sentence: string) => sentence.trim());

    return sentences.map((sentence: string, idx: number) => (
      <React.Fragment key={`${key}-${idx}`}>
        <span className="sentence">{sentence}</span>
        {idx < sentences.length - 1 && ' '} {/* Add space between sentences */}
      </React.Fragment>
    ));
  };

  const markdownComponents = useMemo<Components>(
    () => ({
      p: ({ children, node, ...props }) => (
        <p {...props}>{processSentences(children)}</p>
      ),
      li: ({ children, node, ...props }) => (
        <li {...props}>{processSentences(children)}</li>
      ),
      h1: ({ children, node, ...props }) => (
        <h1 {...props}>{processSentences(children)}</h1>
      ),
      h2: ({ children, node, ...props }) => (
        <h2 {...props}>{processSentences(children)}</h2>
      ),
      h3: ({ children, node, ...props }) => (
        <h3 {...props}>{processSentences(children)}</h3>
      ),
    }),
    [],
  ); // Empty dependency array since these components don't depend on any props

  const memoizedMarkdown = useMemo(
    () => (
      <div className="group relative">
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute -right-2 top-0 opacity-100 transition-opacity group-hover:opacity-100 sm:-right-12 sm:opacity-0"
          size="icon"
          variant="ghost"
          title={isEditing ? 'View mode' : 'Edit mode'}
        >
          {isEditing ? (
            <Eye className="h-4 w-4" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </Button>
        {isEditing ? (
          <Editor
            key={`content-${note.id}`}
            disableLocalStorage
            defaultValue={note?.content || ''}
            onUpdate={handleContentUpdate}
            extensions={[Markdown]}
            className="novel-editor bg-rgray-4 border-rgray-7 mt-2 overflow-y-auto rounded-lg border [&>div>div]:p-2 sm:[&>div>div]:p-5"
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer pr-8 sm:pr-0"
          >
            <ReactMarkdown components={markdownComponents}>
              {note.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    ),
    [note.content, markdownComponents, isEditing, note.id],
  );

  const memoizedSummary = useMemo(
    () => (
      <div className="group relative">
        <Button
          onClick={() => setIsEditingSummary(!isEditingSummary)}
          className="absolute -right-2 top-0 opacity-100 transition-opacity group-hover:opacity-100 sm:-right-12 sm:opacity-0"
          size="icon"
          variant="ghost"
          title={isEditingSummary ? 'View mode' : 'Edit mode'}
        >
          {isEditingSummary ? (
            <Eye className="h-4 w-4" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </Button>
        {isEditingSummary ? (
          <Editor
            key={`summary-${note.id}`}
            disableLocalStorage
            defaultValue={note.summary || ''}
            onUpdate={handleSummaryUpdate}
            extensions={[Markdown]}
            className="novel-editor bg-rgray-4 border-t-rgray-7 mt-2 overflow-y-auto border-t pt-4 [&>div>div]:p-2 sm:[&>div>div]:p-0"
          />
        ) : (
          <div
            onClick={() => setIsEditingSummary(true)}
            className="cursor-pointer pr-8 sm:pr-0"
          >
            <ReactMarkdown>{note.summary}</ReactMarkdown>
          </div>
        )}
      </div>
    ),
    [note.summary, isEditingSummary, note.id],
  );

  if (!note) return <div>PublicNoteView Note not found noteId</div>;
  return (
    <div className={`${fontOptions[font]} mx-auto max-w-4xl`}>
      <div className="rounded-lg transition-colors">
        {videoId && <YouTubeEmbed videoId={videoId} />}

        {!isReadingMode && note.summary && note.summary.length > 0 && (
          <div className="mt-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-800/50 sm:p-4">
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-gray-200 py-2 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Summary</h3>
            </div>
            <div className="prose prose-sm max-w-none pt-4 dark:prose-invert sm:prose">
              {memoizedSummary}
            </div>
          </div>
        )}

        <div className="">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b px-1 py-1 shadow-sm backdrop-blur-sm">
            {isEditing ? (
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setIsEditingSummary(false);
                }}
                variant="outline"
                size="sm"
                title={'Switch to view mode'}
              >
                <Eye className="h-4 w-4" />
                <span className="px-2">Switch to view mode</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {!isReading && <TextToSpeech />}

                {!isPausedAudio && !isPlayingAudio && (
                  <Button
                    onClick={() => {
                      if (isReading) {
                        if (isPausedReading) {
                          setIsPausedReading(false);
                          handleReadingProgress();
                        } else {
                          setIsPausedReading(true);
                          if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                          }
                        }
                      } else {
                        setIsReading(true);
                        setIsPausedReading(false);
                        handleReadingProgress();
                      }
                    }}
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isReading ? (
                      isPausedReading ? (
                        <>
                          <PlayIcon className="h-3.5 w-3.5" />
                          Resume
                        </>
                      ) : (
                        <>
                          <PauseIcon className="h-3.5 w-3.5" />
                          Pause
                        </>
                      )
                    ) : (
                      <>
                        <RabbitIcon className="h-3.5 w-3.5" />
                        Fast Read
                      </>
                    )}
                  </Button>
                )}

                {isReading && (
                  <Button
                    onClick={() => {
                      setIsReading(false);
                      setIsPausedReading(false);
                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                      }
                      sentenceRefs.current[currentSentence]?.classList.remove(
                        'highlighted-sentence',
                      );
                      currentSentence = 0;
                    }}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <TurtleIcon className="h-3.5 w-3.5" />
                    Stop
                  </Button>
                )}
                <ReadingSettingDialog />
              </div>
            )}
          </div>
          <div className="prose prose-sm max-w-none pt-4 dark:prose-invert sm:prose">
            {memoizedMarkdown}
          </div>
        </div>
      </div>
    </div>
  );
};
