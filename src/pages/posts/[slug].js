import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Import the necessary functions from the 'lib/posts' file
import { getPostBySlug, getRecentPosts, getRelatedPosts } from 'lib/posts';
import { categoryPathBySlug } from 'lib/categories';

export default function Post() {
  const router = useRouter();

  useEffect(() => {
    const graphqlEndpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
    const domain = graphqlEndpoint.replace('/graphql', '');

    const redirectUrl = domain + '/' + router.query.slug;
    window.location.replace(redirectUrl);
  }, [router]);

  return <div>Redirecting...</div>;
}

export async function getStaticProps() {
  return {
    props: {},
  };
}

export async function getStaticPaths() {
  const { posts } = await getRecentPosts({
    count: process.env.POSTS_PRERENDER_COUNT,
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
