import { sortPosts } from '@/lib/utils';
import { posts } from '#site/content';
import { PostItem } from '@/components/post-item';
import { InstallButton } from '@/components/install-button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { JsonLd } from 'react-schemaorg';
import { WebSite, SoftwareApplication, VideoObject } from 'schema-dts';
import Image from 'next/image';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const description =
  'iTracksy: AI-powered Chrome extension for smart browsing. Get website summaries, YouTube insights, and access an AI Prompt Library.';

export const metadata: Metadata = {
  title: 'iTracksy: AI-Powered Chrome Extension for Smart Browsing',
  description: description,
  keywords:
    'AI, Chrome extension, browsing assistant, website summaries, YouTube insights, AI prompts',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'iTracksy - AI-Powered Browsing Assistant',
    description: description,
    type: 'website',
    url: 'https://www.itracksy.com',
    images: [
      {
        url: 'https://www.itracksy.com/logo-300.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iTracksy - AI-Powered Browsing Assistant',
    description: description,
    images: ['https://www.itracksy.com/logo-300.png'],
  },
  alternates: {
    canonical: 'https://www.itracksy.com',
  },
};

export default async function Home() {
  const latestPosts = sortPosts(posts).slice(0, 5);

  return (
    <>
      <JsonLd<SoftwareApplication>
        item={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'iTracksy',
          operatingSystem: 'Chrome',
          applicationCategory: 'BrowserExtension',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />

      <div className="min-h-dvh relative flex flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <section className="hero-section bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
            <div className="container mx-auto flex flex-col items-center gap-8 px-4 text-center md:flex-row md:justify-center">
              <div className="flex flex-col items-center md:w-1/2">
                <h1 className="mb-6 text-4xl font-bold text-primary md:text-5xl">
                  Your Everyday AI Assistant On Browser
                </h1>
                <p className="mb-8 text-lg text-muted-foreground">
                  Boost productivity 10x. Save hours a day. Available anytime,
                  anywhere.
                </p>
                <InstallButton isAutoDetect={true} />
              </div>
            </div>
          </section>

          <section className="features-section bg-secondary/5 py-16">
            <div className="container mx-auto px-4">
              <h2 className="mb-12 text-center text-3xl font-bold">
                What Can iTracksy Do For You?
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {[
                  {
                    title: 'AI Website Summary',
                    icon: '📄',
                    description:
                      'iTracksy saves 90% of your time by summarizing website, giving key points and directly answering any of your questions about the content',
                  },
                  {
                    title: 'YouTube Insights',
                    icon: '🎥',
                    description:
                      'Capture everything from YouTube videos without having to watch in just a click.',
                  },
                  {
                    title: 'Web to Note',
                    icon: '✂️',
                    description:
                      'Save any content on the Internet into your iTracksy note to research, read or hear later while also editing them however and whenever you want.',
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-lg bg-card p-6 shadow-md"
                  >
                    <div className="mb-4 text-4xl">{feature.icon}</div>
                    <h3 className="mb-2 text-xl font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="features-section bg-secondary/5 py-16">
            <div className="container mx-auto px-4">
              <h2 className="mb-12 text-center text-3xl font-bold">
                What Can iTracksy Do For You?
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {[
                  {
                    title: 'Content Fatigue',
                    icon: '/images/tired-icon.png',
                    description:
                      'Feeling tired of watching and reading lengthy videos and texts? iTracksy helps you digest content quickly and efficiently.',
                  },
                  {
                    title: 'Time Management',
                    icon: '/images/clock-icon.png',
                    description:
                      'Stop wasting precious time finding information and switching between tabs. Let AI do the heavy lifting for you.',
                  },
                  {
                    title: 'Information Retention',
                    icon: '/images/memory-icon.png',
                    description:
                      'Never forget valuable, important, or interesting information from the internet. Save and organize everything that matters.',
                  },
                ].map((item) => (
                  <Card key={item.title} className="text-center">
                    <CardHeader>
                      <Image
                        src={item.icon}
                        alt={item.title}
                        width={200}
                        height={200}
                        className="mx-auto mb-6"
                      />
                      <CardTitle className="mb-4 text-xl">
                        {item.title}
                      </CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
                {[
                  {
                    title: 'AI Personal Assistant',
                    icon: '🗨️',
                    description:
                      'Use iTracksy as your AI assistant with integrated state-of-the-art language models such as ChatGPT, Bing Copilot, Claude, and others.',
                  },
                  {
                    title: 'Second Brain',
                    icon: '🚀',
                    description:
                      'Store all knowledge from Internet to your personal space on private iTracksy dashboard and easily organize, edit, write and even share them with friends.',
                  },
                  {
                    title: 'Powerful Writing',
                    icon: '✍️',
                    description:
                      'Write research, essays, plans, etc. just in a blink and reply to social media comments, emails and other documents with curated, suitable answers.',
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-lg bg-card p-6 shadow-md"
                  >
                    <div className="mb-4 text-4xl">{feature.icon}</div>
                    <h3 className="mb-2 text-xl font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/blog/features"
                  className="text-primary hover:underline"
                >
                  Learn more about our features
                </Link>
              </div>
            </div>
          </section>

          <section className="blog-section container mx-auto px-4 py-16">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Latest Posts
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <PostItem
                  key={post.slug}
                  slug={post.slug}
                  title={post.title}
                  description={post.description}
                  date={post.date}
                  tags={post.tags}
                />
              ))}
            </div>
          </section>

          <section className="cta-section bg-primary/10 py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="mb-6 text-3xl font-bold">Ready to Get Started?</h2>
              <p className="mb-8 text-lg">
                Join thousands of users who are already enjoying the benefits of
                AI-powered browsing with iTracksy.
              </p>
              <InstallButton isAutoDetect={true} />
              <div className="mt-4">
                <Link
                  href="/blog/testimonials"
                  className="text-primary hover:underline"
                >
                  See what our users are saying
                </Link>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
