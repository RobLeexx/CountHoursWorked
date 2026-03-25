import { useEffect, useState } from 'react';

import { useToggle } from '@/hooks';
import { exampleService } from '@/services';
import type { ExamplePost } from '@/types';

export function useExamplePost() {
  const details = useToggle(false);
  const [post, setPost] = useState<ExamplePost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await exampleService.getFeaturedPost();
      setPost(result);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return {
    post,
    loading,
    error,
    reload: load,
    details,
  };
}

