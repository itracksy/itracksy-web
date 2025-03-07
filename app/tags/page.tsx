import { getAllTags, sortTagsByCount } from '@/lib/utils';
import { Metadata } from 'next';
import { posts } from '#site/content';
import { Tag } from '@/components/tag';

export const metadata: Metadata = {
  title: 'Tags - BuddyBeep',
  description:
    'Explore all topic tags for BuddyBeep blog posts. Find articles on various subjects and categories.',
  openGraph: {
    title: 'Tags - BuddyBeep',
    description:
      'Explore all topic tags for BuddyBeep blog posts. Find articles on various subjects and categories.',
    type: 'website',
    url: 'https://www.buddybeep.com/tags',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tags - BuddyBeep',
    description:
      'Explore all topic tags for BuddyBeep blog posts. Find articles on various subjects and categories.',
  },
};

export default async function TagsPage() {
  const tags = getAllTags(posts);
  const sortedTags = sortTagsByCount(tags);

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block text-4xl font-black lg:text-5xl">Tags</h1>
          <p className="text-xl text-muted-foreground">
            Browse all topics and categories covered in BuddyBeep blog posts.
          </p>
        </div>
      </div>
      <hr className="my-4" />
      <nav aria-label="Tags navigation">
        <ul className="flex flex-wrap gap-2">
          {sortedTags?.map((tag) => (
            <li key={tag}>
              <Tag tag={tag} count={tags[tag]} />
            </li>
          ))}
        </ul>
      </nav>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Tags - BuddyBeep',
          description:
            'Explore all topic tags for BuddyBeep blog posts. Find articles on various subjects and categories.',
          url: 'https://www.buddybeep.com/tags',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: sortedTags.map((tag, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: tag,
              url: `https://www.buddybeep.com/tags/${tag}`,
            })),
          },
        })}
      </script>
    </div>
  );
}
