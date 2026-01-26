#!/usr/bin/env node

/**
 * Schema Check Script
 * Compares local schema with remote schema to detect changes
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const INTROSPECTION_PATH = path.join(__dirname, '..', 'graphql', 'schema.json');
const SCHEMA_HASH_PATH = path.join(__dirname, '..', 'graphql', '.schema-hash');

function getSchemaHash(schema) {
  return crypto.createHash('sha256').update(JSON.stringify(schema)).digest('hex');
}

function main() {
  if (!fs.existsSync(INTROSPECTION_PATH)) {
    console.log('⚠️  No local schema found. Run "npm run schema:sync" first.');
    process.exit(1);
  }

  const localSchema = JSON.parse(fs.readFileSync(INTROSPECTION_PATH, 'utf8'));
  const localHash = getSchemaHash(localSchema);

  let previousHash = null;
  if (fs.existsSync(SCHEMA_HASH_PATH)) {
    previousHash = fs.readFileSync(SCHEMA_HASH_PATH, 'utf8').trim();
  }

  if (previousHash && previousHash !== localHash) {
    console.log('⚠️  Schema has changed! Run "npm run codegen" to update types.');
    process.exit(1);
  } else if (!previousHash) {
    fs.writeFileSync(SCHEMA_HASH_PATH, localHash);
    console.log('✅ Schema hash saved.');
  } else {
    console.log('✅ Schema is up to date.');
  }
}

main();
