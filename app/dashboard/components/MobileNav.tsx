'use client';
import { Button } from '@/components/ui/button';
import { SheetTrigger, SheetContent, Sheet } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import { NoteList } from './NoteList';
import { useState } from 'react';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="w-full" size="sm" variant="outline">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0 sm:w-[400px]">
          <div className="h-full overflow-y-auto bg-gray-100 dark:bg-gray-800">
            <NoteList onClickItem={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
