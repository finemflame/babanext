/* eslint-disable prettier/prettier */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Helmet } from 'react-helmet';
import Link from 'next/link';

import { getPostBySlug, getRecentPosts, getRelatedPosts, postPathBySlug } from 'lib/posts';
import { categoryPathBySlug } from 'lib/categories';
import { formatDate } from 'lib/datetime';
import { ArticleJsonLd } from 'lib/json-ld';
import { helmetSettingsFromMetadata } from 'lib/site';
import useSite from 'hooks/use-site';
import usePageMetadata from 'hooks/use-page-metadata';

import Layout from 'components/Layout';
import Header from 'components/Header';
import Section from 'components/Section';
import Container from 'components/Container';
import Content from 'components/Content';
import Metadata from 'components/Metadata';
import FeaturedImage from 'components/FeaturedImage';

import styles from 'styles/pages/Post.module.scss';

export default function Post() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      const graphqlEndpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
      const domain = new URL(graphqlEndpoint).origin;

      const redirectUrl = domain + router.asPath;
      window.location.replace(redirectUrl);
    }
  }, [router.isReady, router.asPath]);

  return null;
}

// Rest of your code...

// Original code starts here
export async function getStaticProps({ params = {} } = {}) {
  const { post } = await getPostBySlug(params?.slug);

  if (!post) {
    return {
      props: {},
      notFound: true,
    };
  }

  const { categories, databaseId: postId } = post;

  const { metadata: siteMetadata = {}, homepage } = useSite();

  if (!post.og) {
    post.og = {};
  }

  const socialImage = `${homepage}${post.featuredImage?.sourceUrl}`;

  post.og.imageUrl = socialImage;
  post.og.imageSecureUrl = socialImage;
  post.og.imageWidth = 2000;
  post.og.imageHeight = 1000;

  const { metadata } = usePageMetadata({
    metadata: {
      ...post,
      title: post.metaTitle || post.title,
      description: post.description || post.og?.description || `Read more about ${post.title}`,
    },
  });

  if (process.env.WORDPRESS_PLUGIN_SEO !== true) {
    metadata.title = `${post.title} - ${siteMetadata.title}`;
    metadata.og.title = metadata.title;
    metadata.twitter.title = metadata.title;
  }

  const metadataOptions = {
    compactCategories: false,
  };

  const props = {
    post,
    socialImage,
  };

  const { category: relatedCategory, posts: relatedPosts } = (await getRelatedPosts(categories, postId)) || {};
  const hasRelated = relatedCategory && Array.isArray(relatedPosts) && relatedPosts.length;

  if (hasRelated) {
    props.related = {
      posts: relatedPosts,
      title: {
        name: relatedCategory.name || null,
        link: categoryPathBySlug(relatedCategory.slug),
      },
    };
  }

  const helmetSettings = helmetSettingsFromMetadata(metadata);

  return {
    props: {
      ...props,
      helmetSettings,
    },
  };
}

export async function getStaticPaths() {
  // Only render the most recent posts to avoid spending unnecessary time
  // querying every single post from WordPress

  // Tip: this can be customized to use data or analytics to determine the
  // most popular posts and render those instead

  const { posts } = await getRecentPosts({
    count: process.env.POSTS_PRERENDER_COUNT, // Update this value in next.config.js!
    queryIncludes: 'index',
  });

  const paths = posts
    .filter(({ slug }) => typeof slug === 'string')
    .map(({ slug }) => ({
      params: {
        slug,
      },
    }));

  return {
    paths,
    fallback: 'blocking',
  };
}
