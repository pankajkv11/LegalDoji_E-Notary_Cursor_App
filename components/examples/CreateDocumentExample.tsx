'use client';

/**
 * Example: Create document component using generated GraphQL hooks
 * Demonstrates mutation usage with auto-generated hooks
 */

import { useState } from 'react';
import { useCreateDocumentMutation } from '@/graphql/generated/hooks';
import { useRouter } from 'next/navigation';

export function CreateDocumentExample() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    templateId: '',
    title: '',
    formData: {} as Record<string, any>,
  });

  const [createDocument, { loading, error }] = useCreateDocumentMutation({
    onCompleted: (data) => {
      if (data.createDocument) {
        router.push(`/dashboard/create?id=${data.createDocument.id}`);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDocument({
      variables: {
        input: {
          templateId: formData.templateId,
          title: formData.title || undefined,
          formData: formData.formData,
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-600 text-sm">
          {error.message}
        </div>
      )}
      
      {/* Form fields */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Document'}
      </button>
    </form>
  );
}
