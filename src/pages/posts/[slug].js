import { useEffect } from 'react';
import { useRouter } from 'next/router';

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
  const paths = [];

  return {
    paths,
    fallback: 'blocking',
  };
}
