import { useAppContext } from '@/context';

export function useProjects() {
  const { projects, createProject, updateProject, deleteProject } = useAppContext();

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById: (projectId: string) => projects.find((project) => project.id === projectId),
  };
}
