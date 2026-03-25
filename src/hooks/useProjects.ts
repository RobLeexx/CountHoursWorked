import { useAppContext } from '@/context';

export function useProjects() {
  const { projects, createProject } = useAppContext();

  return {
    projects,
    createProject,
    getProjectById: (projectId: string) => projects.find((project) => project.id === projectId),
  };
}
