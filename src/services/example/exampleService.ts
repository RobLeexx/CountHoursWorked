import { apiClient } from '@/api';
import type { ExamplePost } from '@/types';

export const exampleService = {
  getFeaturedPost() {
    return apiClient.get<ExamplePost>('/posts/1');
  },
};

