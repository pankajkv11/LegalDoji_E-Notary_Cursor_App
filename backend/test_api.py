#!/usr/bin/env python3
"""Test script for GraphQL and FastAPI endpoints."""
import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"
GRAPHQL_URL = f"{BASE_URL}/api/v1/graphql"


def print_section(title: str):
    """Print a formatted section header."""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def test_fastapi_health():
    """Test FastAPI health endpoint."""
    print_section("Testing FastAPI Health Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_graphql_introspection():
    """Test GraphQL introspection query."""
    print_section("Testing GraphQL Introspection")
    query = """
    query IntrospectionQuery {
      __schema {
        queryType {
          name
          fields {
            name
            description
          }
        }
        mutationType {
          name
          fields {
            name
            description
          }
        }
      }
    }
    """
    try:
        response = requests.post(
            GRAPHQL_URL,
            json={"query": query},
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        if "errors" in data:
            print(f"Errors: {json.dumps(data['errors'], indent=2)}")
        else:
            schema = data.get("data", {}).get("__schema", {})
            query_type = schema.get("queryType", {})
            mutation_type = schema.get("mutationType", {})
            
            print(f"\nQuery Type: {query_type.get('name', 'N/A')}")
            print(f"\nAvailable Queries ({len(query_type.get('fields', []))}):")
            for field in query_type.get("fields", [])[:10]:  # Show first 10
                print(f"  - {field.get('name')}: {field.get('description', 'No description')}")
            
            print(f"\nMutation Type: {mutation_type.get('name', 'N/A')}")
            print(f"\nAvailable Mutations ({len(mutation_type.get('fields', []))}):")
            for field in mutation_type.get("fields", [])[:10]:  # Show first 10
                print(f"  - {field.get('name')}: {field.get('description', 'No description')}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_graphql_queries():
    """Test GraphQL queries that don't require authentication."""
    print_section("Testing GraphQL Queries (Public)")
    
    # Test services query
    print("\n1. Testing 'services' query:")
    query_services = """
    query {
      services {
        id
        name
        description
        price
        category
      }
    }
    """
    try:
        response = requests.post(
            GRAPHQL_URL,
            json={"query": query_services},
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        data = response.json()
        if "errors" in data:
            print(f"   Errors: {json.dumps(data['errors'], indent=2)}")
        else:
            services = data.get("data", {}).get("services", [])
            print(f"   Found {len(services)} services")
            if services:
                print(f"   First service: {json.dumps(services[0], indent=4)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test FAQs query
    print("\n2. Testing 'faqs' query:")
    query_faqs = """
    query {
      faqs {
        id
        question
        answer
        category
      }
    }
    """
    try:
        response = requests.post(
            GRAPHQL_URL,
            json={"query": query_faqs},
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        data = response.json()
        if "errors" in data:
            print(f"   Errors: {json.dumps(data['errors'], indent=2)}")
        else:
            faqs = data.get("data", {}).get("faqs", [])
            print(f"   Found {len(faqs)} FAQs")
            if faqs:
                print(f"   First FAQ: {json.dumps(faqs[0], indent=4)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test pricing plans query
    print("\n3. Testing 'pricingPlans' query:")
    query_pricing = """
    query {
      pricingPlans {
        id
        name
        price
        features
      }
    }
    """
    try:
        response = requests.post(
            GRAPHQL_URL,
            json={"query": query_pricing},
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        data = response.json()
        if "errors" in data:
            print(f"   Errors: {json.dumps(data['errors'], indent=2)}")
        else:
            plans = data.get("data", {}).get("pricingPlans", [])
            print(f"   Found {len(plans)} pricing plans")
            if plans:
                print(f"   First plan: {json.dumps(plans[0], indent=4)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test document templates query
    print("\n4. Testing 'documentTemplates' query:")
    query_templates = """
    query {
      documentTemplates {
        id
        slug
        name
        category
        description
      }
    }
    """
    try:
        response = requests.post(
            GRAPHQL_URL,
            json={"query": query_templates},
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        data = response.json()
        if "errors" in data:
            print(f"   Errors: {json.dumps(data['errors'], indent=2)}")
        else:
            templates = data.get("data", {}).get("documentTemplates", [])
            print(f"   Found {len(templates)} document templates")
            if templates:
                print(f"   First template: {json.dumps(templates[0], indent=4)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test notaries query
    print("\n5. Testing 'notaries' query:")
    query_notaries = """
    query {
      notaries {
        id
        name
        email
        specialization
        location
        status
      }
    }
    """
    try:
        response = requests.post(
            GRAPHQL_URL,
            json={"query": query_notaries},
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        data = response.json()
        if "errors" in data:
            print(f"   Errors: {json.dumps(data['errors'], indent=2)}")
        else:
            notaries = data.get("data", {}).get("notaries", [])
            print(f"   Found {len(notaries)} notaries")
            if notaries:
                print(f"   First notary: {json.dumps(notaries[0], indent=4)}")
    except Exception as e:
        print(f"   Error: {e}")


def test_graphql_mutations():
    """Test GraphQL mutations."""
    print_section("Testing GraphQL Mutations")
    
    # Test signup mutation
    print("\n1. Testing 'signup' mutation:")
    mutation_signup = """
    mutation Signup($input: SignupInput!) {
      signup(input: $input) {
        accessToken
        refreshToken
        expiresIn
        user {
          id
          name
          email
          phone
          role
        }
      }
    }
    """
    variables = {
        "input": {
            "name": "Test User",
            "email": f"test{hash('test') % 10000}@example.com",
            "phone": "+919876543210",
            "password": "TestPassword123!",
            "acceptTerms": True
        }
    }
    try:
        response = requests.post(
            GRAPHQL_URL,
            json={"query": mutation_signup, "variables": variables},
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        data = response.json()
        if "errors" in data:
            print(f"   Errors: {json.dumps(data['errors'], indent=2)}")
        else:
            signup_data = data.get("data", {}).get("signup", {})
            if signup_data:
                print(f"   ✓ Signup successful!")
                print(f"   User ID: {signup_data.get('user', {}).get('id')}")
                print(f"   User Email: {signup_data.get('user', {}).get('email')}")
                print(f"   Access Token: {signup_data.get('accessToken', '')[:50]}...")
                return signup_data.get("accessToken")
    except Exception as e:
        print(f"   Error: {e}")
    
    return None


def test_authenticated_query(access_token: str):
    """Test authenticated GraphQL query."""
    print_section("Testing Authenticated GraphQL Query")
    
    if not access_token:
        print("No access token available, skipping authenticated test")
        return
    
    query_me = """
    query {
      me {
        id
        name
        email
        phone
        role
        status
      }
    }
    """
    try:
        response = requests.post(
            GRAPHQL_URL,
            json={"query": query_me},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        if "errors" in data:
            print(f"Errors: {json.dumps(data['errors'], indent=2)}")
        else:
            user = data.get("data", {}).get("me", {})
            if user:
                print(f"✓ Authenticated query successful!")
                print(f"User: {json.dumps(user, indent=2)}")
            else:
                print("No user data returned")
    except Exception as e:
        print(f"Error: {e}")


def test_fastapi_docs():
    """Test FastAPI documentation endpoints."""
    print_section("Testing FastAPI Documentation")
    
    endpoints = [
        "/docs",
        "/redoc",
        "/openapi.json"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            print(f"{endpoint}: {response.status_code} {'✓' if response.status_code == 200 else '✗'}")
        except Exception as e:
            print(f"{endpoint}: Error - {e}")


def main():
    """Run all tests."""
    print("\n" + "🚀 E-Notary API Testing Suite".center(60))
    print("=" * 60)
    
    # Test FastAPI
    test_fastapi_health()
    test_fastapi_docs()
    
    # Test GraphQL
    test_graphql_introspection()
    test_graphql_queries()
    
    # Test mutations and get access token
    access_token = test_graphql_mutations()
    
    # Test authenticated query if we have a token
    if access_token:
        test_authenticated_query(access_token)
    
    print_section("Testing Complete")
    print("\n📝 Summary:")
    print(f"  - FastAPI Health: http://localhost:8000/health")
    print(f"  - FastAPI Docs: http://localhost:8000/docs")
    print(f"  - GraphQL Endpoint: http://localhost:8000/api/v1/graphql")
    print(f"  - GraphQL Playground: http://localhost:8000/api/v1/graphql (use POST requests)")
    print("\n✅ All tests completed!")


if __name__ == "__main__":
    main()
