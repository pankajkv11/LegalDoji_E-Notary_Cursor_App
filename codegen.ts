import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8000/api/v1/graphql',
  documents: ['graphql/**/*.graphql'],
  generates: {
    'graphql/generated/types.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          DateTime: 'string',
          Date: 'string',
          JSON: 'Record<string, any>',
        },
        enumsAsTypes: true,
        skipTypename: false,
        useIndexSignature: true,
      },
    },
    'graphql/generated/operations.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        scalars: {
          DateTime: 'string',
          Date: 'string',
          JSON: 'Record<string, any>',
        },
        skipTypename: false,
      },
    },
    'graphql/generated/hooks.tsx': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        apolloClientVersion: 3,
        skipTypename: false,
        scalars: {
          DateTime: 'string',
          Date: 'string',
          JSON: 'Record<string, any>',
        },
        dedupeOperationSuffix: true,
        dedupeFragments: true,
      },
    },
    'graphql/generated/introspection.json': {
      plugins: ['introspection'],
    },
  },
};

export default config;
