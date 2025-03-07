'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ReactElement, SVGProps, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/app/login/submit-button';

function PlusIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export const NoteCreateDialog: React.FunctionComponent<{
  createNote: (formData: FormData) => Promise<void>;
}> = ({ createNote }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="h-8 w-8 rounded-full"
          size="icon"
          variant="outline"
          onClick={() => {
            setOpen(true);
          }}
        >
          <PlusIcon className="h-4 w-4" />
          <span className="sr-only">New note</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-4" action={createNote}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Name
            </Label>
            <Input id="title" name="title" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>

            <Textarea
              id="content"
              name="content"
              className="col-span-3 h-96"
              placeholder="Type your message here."
            />
          </div>
          <Button
            onClick={() => {
              setOpen(false);
            }}
            type="submit"
          >
            Create Note
          </Button>
        </form>

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
