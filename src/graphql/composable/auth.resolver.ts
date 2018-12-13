import { GraphQLFieldResolver } from "graphql";

import { ComposableResolver } from "./composable.resolver";
import { ResolverContext } from "../../interfaces/ResolverContextInterface";

// Resolvers return AuthResolvers
export const authResolver: ComposableResolver<any, ResolverContext> = 
    (resolver: GraphQLFieldResolver<any, ResolverContext>) : GraphQLFieldResolver<any, ResolverContext> => {

        return (parent, args, context: ResolverContext, info) => {
            if(context.user || context.authorization){
                return resolver(parent, args, context, info);
            }
            // Token not provided call throw error.
            throw new Error('Unauthorized! Token not provided!');
        };
    };