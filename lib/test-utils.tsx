import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { apolloClient } from './apollo-client';

interface AllTheProvidersProps {
  children: React.ReactNode;
  mocks?: MockedResponse[];
}

function AllTheProviders({ children, mocks = [] }: AllTheProvidersProps) {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { mocks?: MockedResponse[] },
) => {
  const { mocks, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} mocks={mocks} />,
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
