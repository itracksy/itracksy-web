import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ShareDialogProps {
  noteId: string;
  isPublic: boolean;
  onTogglePublic: (isPublic: boolean) => Promise<void>;
  noteTitle: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  noteId,
  isPublic,
  onTogglePublic,
  noteTitle,
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

  const shareOnSocialMedia = (platform: string) => {
    const encodedUrl = encodeURIComponent(publicUrl);
    const encodedTitle = encodeURIComponent(noteTitle);
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
        break;
    }

    window.open(url, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-toggle">Make note public</Label>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              disabled={isLoading}
            />
          </div>
          {isPublic && (
            <>
              <div className="space-y-2">
                <Label htmlFor="public-url">Public URL</Label>
                <div className="flex space-x-2">
                  <Input id="public-url" value={publicUrl} readOnly />
                  <Button onClick={copyLinkToClipboard} size="icon">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Share on social media</Label>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => shareOnSocialMedia('facebook')}
                    size="icon"
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('twitter')}
                    size="icon"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('linkedin')}
                    size="icon"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
