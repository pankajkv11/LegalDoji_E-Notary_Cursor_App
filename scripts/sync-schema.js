#!/usr/bin/env node

/**
 * Schema Sync Script
 * Fetches the GraphQL schema from the endpoint and saves it locally
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8000/api/v1/graphql';
const SCHEMA_PATH = path.join(__dirname, '..', 'graphql', 'schema.graphql');
const INTROSPECTION_PATH = path.join(__dirname, '..', 'graphql', 'schema.json');

const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

function fetchSchema() {
  return new Promise((resolve, reject) => {
    const url = new URL(GRAPHQL_ENDPOINT);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const postData = JSON.stringify({
      query: introspectionQuery,
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.errors) {
            reject(new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`));
            return;
          }
          resolve(json.data);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    console.log(`🔄 Fetching schema from ${GRAPHQL_ENDPOINT}...`);
    const schema = await fetchSchema();

    // Save introspection JSON
    const schemaDir = path.dirname(SCHEMA_PATH);
    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir, { recursive: true });
    }

    fs.writeFileSync(INTROSPECTION_PATH, JSON.stringify(schema, null, 2));
    console.log(`✅ Schema saved to ${INTROSPECTION_PATH}`);

    // Note: Converting introspection to SDL requires additional tooling
    // For now, we'll use the JSON schema for codegen
    console.log('✅ Schema sync complete!');
    console.log('💡 Run "npm run codegen" to generate types and hooks');
  } catch (error) {
    console.error('❌ Error syncing schema:', error.message);
    process.exit(1);
  }
}

main();
