import { MainLayout } from '@/components';
import { useAppContext } from '@/context';

export function ProjectionsScreen() {
  const { t } = useAppContext();

  return <MainLayout showHeader={false} title={t('sidebar.projections')} />;
}
