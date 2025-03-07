'use client';
import React, { useState, useEffect } from 'react';

import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { CopyIcon, ShareIcon } from 'lucide-react';
import ShareButton from './ShareButton';

interface PublicSharingProps {
  noteId: string;
  isPublic: boolean;
  onTogglePublic: (isPublic: boolean) => Promise<void>;
  noteTitle: string;
  noteDescription: string;
}

export const PublicSharing: React.FC<PublicSharingProps> = ({
  noteId,
  isPublic,
  onTogglePublic,
  noteTitle,
  noteDescription,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const publicUrl = `${window.location.origin}/public-notes/${noteId}`;

  const handleTogglePublic = async () => {
    setIsLoading(true);
    try {
      await onTogglePublic(!isPublic);
      toast({
        title: isPublic ? 'Note is now private' : 'Note is now public',
        description: isPublic
          ? 'The sharing link has been disabled.'
          : 'You can now share this note with others.',
      });
    } catch (error) {
      console.error('Error toggling public status:', error);
      toast({
        title: 'Error',
        description:
          "Failed to change the note's public status. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    toast({
      title: 'Link copied!',
      description: 'The public link has been copied to your clipboard.',
    });
  };

  return (
    <div className="mt-4 space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="public-toggle" className="text-sm font-medium">
          Make note public
        </Label>
        <Switch
          id="public-toggle"
          checked={isPublic}
          onCheckedChange={handleTogglePublic}
          disabled={isLoading}
        />
      </div>
      {isPublic && (
        <div className="space-y-2">
          <Label htmlFor="public-url" className="text-sm font-medium">
            Public URL
          </Label>
          <div className="flex space-x-2">
            <Input
              id="public-url"
              value={publicUrl}
              readOnly
              className="flex-grow"
            />
            <ShareButton
              url={publicUrl}
              title={noteTitle}
              description={noteDescription}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Anyone with this link can view your note.
          </p>
        </div>
      )}
    </div>
  );
};
