import { render, screen, waitFor } from '@/lib/test-utils';
import { ServicesExample } from '@/components/examples/ServicesExample';
import { gql } from '@apollo/client';

const GET_SERVICES = gql`
  query Services {
    services {
      id
      name
      description
      price
    }
  }
`;

const mocks = [
  {
    request: {
      query: GET_SERVICES,
    },
    result: {
      data: {
        services: [
          {
            id: '1',
            name: 'Notarization',
            description: 'Document notarization service',
            price: '₹500',
          },
        ],
      },
    },
  },
];

describe('ServicesExample', () => {
  it('renders services from GraphQL', async () => {
    render(<ServicesExample />, { mocks });

    expect(screen.getByText('Loading services...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Notarization')).toBeInTheDocument();
    });
  });
});
