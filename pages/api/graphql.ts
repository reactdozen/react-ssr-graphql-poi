// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { ApolloServer, gql } from "apollo-server-micro";
import { ContextFunction } from "apollo-server-core";

const MATCHING_AUTH_HEADER = "valid-auth-header";

const typeDefs = gql`
  type Query {
    items: [Item]!
  }

  type Item {
    name: String!
    description: String!
    price: Int
  }
`;

const resolvers = {
  Query: {
    items(parent, args, context: ApolloServerContext) {
      const item = {
        name: "item-1",
        description: "some-description",
        price: 123,
      };

      if (context.X_AUTH_HEADER !== MATCHING_AUTH_HEADER) {
        delete item["price"];
      }

      return [item];
    },
  },
};

type ApolloServerContext = { X_AUTH_HEADER: string };

const makeApolloServerContext: ContextFunction<any, ApolloServerContext> = (
  requestContext
) => {
  const { req } = requestContext;
  return { X_AUTH_HEADER: req.headers["x-auth-header"] || "" };
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: makeApolloServerContext,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: "/api/graphql" });
