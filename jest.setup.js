import '@testing-library/jest-dom'
import { MockedProvider } from '@apollo/client/testing'

// Mock Apollo Client for tests
global.MockedProvider = MockedProvider
