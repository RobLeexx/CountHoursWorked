import { useCallback } from 'react';

import { useAppContext } from '@/context';

export function useProjects() {
  const { projects, createProject, updateProject, deleteProject } = useAppContext();
  const getProjectById = useCallback(
    (projectId: string) => projects.find((project) => project.id === projectId),
    [projects],
  );

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
  };
}
