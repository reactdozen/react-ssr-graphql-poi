import { GetServerSideProps } from "next";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  NormalizedCacheObject,
  ApolloProvider,
  useQuery,
  useApolloClient,
  TypePolicies,
} from "@apollo/client";
import { useEffect } from "react";

type IndexPageProps = IndexPageServerSideProps;
type IndexPageServerSideProps = {
  apolloCache: NormalizedCacheObject;
};

const IndexPage: React.FC<IndexPageProps> = (props) => {
  const { apolloCache } = props;
  const apolloClient = new ApolloClient({
    uri: "http://localhost:3000/api/graphql",
    cache: new InMemoryCache({
      typePolicies: { ...itemsCacheMergePolicy },
    }).restore(apolloCache),
  });

  return (
    <ApolloProvider client={apolloClient}>
      <div>Hello world!</div>
      <ItemsGraphqlComponent />
    </ApolloProvider>
  );
};

const ItemsGraphqlComponent: React.FC = () => {
  const client = useApolloClient();

  useEffect(() => {
    const poiQueryFunction = async () => {
      await client.query({
        query: QUERY_ITEMS_POI,
        context: { headers: { "x-auth-header": "valid-auth-header" } },
        fetchPolicy: "network-only",
      });
    };
    poiQueryFunction();
  }, []);

  const { loading, error, data } = useQuery(QUERY_ITEMS, {
    fetchPolicy: "cache-only",
  });
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

const itemsCacheMergePolicy: TypePolicies = {
  Query: {
    fields: {
      items: {
        merge: (existing: Item[] = [], incoming: Item[] = []) => {
          const incomingMap = keyBy("name", incoming);

          const mergedItems: Item[] = existing.map((item) => {
            const { name } = item;
            if (!(name in incomingMap)) {
              return item;
            }
            return { ...item, ...incomingMap[name] };
          });

          return mergedItems;
        },
      },
    },
  },
};

type Item = { name: string; description: string; price?: number };

const keyBy = (key: string, items: Object[]) => {
  return items.reduce((acc, item) => ({ ...acc, [item[key]]: item }), {});
};

const QUERY_ITEMS = gql`
  query Items {
    items {
      name
      description
      price
    }
  }
`;

const QUERY_ITEMS_POI = gql`
  query ItemsPoi {
    items {
      name
      price
    }
  }
`;

export default IndexPage;
