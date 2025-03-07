'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Play, Pause, Square } from 'lucide-react';

interface TextToSpeechProps { }

export const TextToSpeech: React.FC<TextToSpeechProps> = () => {
  const { handlePlay, handlePause, handleStop, isPausedAudio, isPlayingAudio } =
    useTextToSpeech();

  return (
    <div className="flex items-center space-x-2 ">
      <Button
        variant="secondary"
        className="flex items-center gap-2"
        onClick={isPlayingAudio && !isPausedAudio ? handlePause : handlePlay}
      >
        {isPlayingAudio && !isPausedAudio ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      {isPlayingAudio && (
        <Button
          size="icon"
          variant="ghost"
          onClick={handleStop}
          disabled={!isPlayingAudio}
          className="h-8 w-8 p-0"
        >
          <Square className="h-4 w-4" />
          <span className="sr-only">Stop</span>
        </Button>
      )}
    </div>
  );
};
