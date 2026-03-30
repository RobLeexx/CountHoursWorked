import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppText, DayDetails, MainLayout, ProjectsManager, Summary, WorkCalendar } from '@/components';
import { useAppContext } from '@/context';
import { useProjects, useWorkLogs } from '@/hooks';
import { addMonths, fromDateKey, toDateKey } from '@/utils';

export function HomeScreen() {
  const { holidayDates, isHydrated, t, toggleHoliday } = useAppContext();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const {
    workLogs,
    dayLogs,
    setHoursForProject,
    clearHoursForProject,
    dailyHours,
    dailyEarningsByCurrency,
    weeklyEarningsByCurrency,
    monthlyEarningsByCurrency,
  } = useWorkLogs(selectedDate);

  useEffect(() => {
    if (projects.length === 0) {
      setSelectedProjectId('');
      return;
    }

    if (!projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const changeMonth = (direction: 'previous' | 'next') => {
    const nextMonth = addMonths(visibleMonth, direction === 'previous' ? -1 : 1);
    setVisibleMonth(nextMonth);
    setSelectedDate(toDateKey(nextMonth));
  };

  return (
    <MainLayout contentContainerStyle={styles.content} showHeader={false} title={t('header.home')}>
      {!isHydrated ? <AppText color="muted">{t('common.loadingSavedData')}</AppText> : null}

      <WorkCalendar
        selectedDate={selectedDate}
        visibleMonth={visibleMonth}
        holidayDates={holidayDates}
        workLogs={workLogs}
        onSelectDate={(dateKey) => {
          setSelectedDate(dateKey);
          const date = fromDateKey(dateKey);
          setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        }}
        onChangeMonth={changeMonth}
      />

      <Summary
        dailyHours={dailyHours}
        dailyEarnings={dailyEarningsByCurrency}
        weeklyEarnings={weeklyEarningsByCurrency}
        monthlyEarnings={monthlyEarningsByCurrency}
      />

      <DayDetails
        selectedDate={selectedDate}
        projects={projects}
        dayLogs={dayLogs}
        isHoliday={holidayDates.includes(selectedDate)}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onSaveHours={setHoursForProject}
        onClearHours={clearHoursForProject}
        onToggleHoliday={() => toggleHoliday(selectedDate)}
      />

      <ProjectsManager
        projects={projects}
        onCreateProject={createProject}
        onUpdateProject={updateProject}
        onDeleteProject={deleteProject}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
});
