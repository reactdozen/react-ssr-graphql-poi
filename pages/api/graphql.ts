// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { ApolloServer, gql } from "apollo-server-micro";

const typeDefs = gql`
  type Query {
    items: [Item]!
  }

  type Item {
    name: String!
    price: Int
  }
`;

const resolvers = {
  Query: {
    items(parent, args, context) {
      return [{ name: "item-1", price: 123 }];
    },
  },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: "/api/graphql" });
