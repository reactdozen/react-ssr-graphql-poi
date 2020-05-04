import { GetServerSideProps } from "next";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  NormalizedCacheObject,
  ApolloProvider,
  useQuery,
} from "@apollo/client";

type IndexPageProps = IndexPageServerSideProps;
type IndexPageServerSideProps = {
  apolloCache: NormalizedCacheObject;
};

const IndexPage: React.FC<IndexPageProps> = (props) => {
  const { apolloCache } = props;
  const apolloClient = new ApolloClient({
    uri: "http://localhost:3000/api/graphql",
    cache: new InMemoryCache().restore(apolloCache),
  });

  return (
    <ApolloProvider client={apolloClient}>
      <div>Hello world!</div>
      <ItemsGraphqlComponent />
    </ApolloProvider>
  );
};

const ItemsGraphqlComponent: React.FC = () => {
  const { loading, error, data } = useQuery(QUERY_ITEMS);
  if (loading) {
    return <>Loading...</>;
  }

  return <>{JSON.stringify(data)}</>;
};

export const getServerSideProps: GetServerSideProps<IndexPageServerSideProps> = async () => {
  const apolloClient = new ApolloClient({
    uri: "http://localhost:3000/api/graphql",
    cache: new InMemoryCache(),
  });

  // precaches items
  await apolloClient.query({ query: QUERY_ITEMS });

  const apolloCache = apolloClient.extract();
  return { props: { apolloCache } };
};

const QUERY_ITEMS = gql`
  query Items {
    items {
      name
      price
    }
  }
`;

export default IndexPage;
