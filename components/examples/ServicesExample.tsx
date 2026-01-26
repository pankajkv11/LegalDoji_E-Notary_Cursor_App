'use client';

/**
 * Example: Services component using generated GraphQL hooks
 * Shows how to fetch data with auto-generated hooks
 */

import { useServicesQuery } from '@/graphql/generated/hooks';

export function ServicesExample() {
  const { data, loading, error } = useServicesQuery();

  if (loading) {
    return <div>Loading services...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data?.services?.map((service) => (
        <div key={service.id} className="border rounded-lg p-4">
          <h3 className="font-semibold">{service.name}</h3>
          <p className="text-sm text-gray-600">{service.description}</p>
          <p className="text-lg font-bold mt-2">{service.price}</p>
        </div>
      ))}
    </div>
  );
}
