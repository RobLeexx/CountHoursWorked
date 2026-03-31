import { MainLayout } from '@/components';
import { useAppContext } from '@/context';

export function ConversionsScreen() {
  const { t } = useAppContext();

  return <MainLayout showHeader={false} title={t('sidebar.conversions')} />;
}
