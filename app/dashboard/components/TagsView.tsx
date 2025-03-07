import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { TagIcon } from './TagIcon';

export const TagsView = (
  <>
    <Label className="text-gray-500 dark:text-gray-400 pt-2">Tags</Label>
    <Link
      className="flex items-center gap-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
      href="#"
    >
      <TagIcon className="h-4 w-4" />
      Design
      <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
        2
      </Badge>
    </Link>
    <Link
      className="flex items-center gap-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
      href="#"
    >
      <TagIcon className="h-4 w-4" />
      Development
      <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
        5
      </Badge>
    </Link>
    <Link
      className="flex items-center gap-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
      href="#"
    >
      <TagIcon className="h-4 w-4" />
      Ideas
      <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
        7
      </Badge>
    </Link>
  </>
);
