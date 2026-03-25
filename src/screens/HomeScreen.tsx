import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppIconButton, AppInput, AppText, DayDetails, MainLayout, Summary, WorkCalendar } from '@/components';
import { useAppContext } from '@/context';
import { useAppTheme } from '@/theme';
import { useProjects, useWorkLogs } from '@/hooks';
import { addMonths, fromDateKey, parseDecimalInput, toDateKey } from '@/utils';

export function HomeScreen() {
  const theme = useAppTheme();
  const { themeMode, toggleThemeMode } = useAppContext();
  const { projects, createProject } = useProjects();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isProjectModalVisible, setProjectModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [hourlyRateValue, setHourlyRateValue] = useState('');
  const {
    workLogs,
    dayLogs,
    setHoursForProject,
    clearHoursForProject,
    dailyHours,
    dailyEarnings,
    weeklyEarnings,
    monthlyEarnings,
  } = useWorkLogs(selectedDate);

  useEffect(() => {
    if (!selectedProjectId && projects[0]) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const parsedHourlyRate = parseDecimalInput(hourlyRateValue);
  const canCreateProject = Boolean(projectName.trim()) && parsedHourlyRate !== null && parsedHourlyRate > 0;
  const resetProjectModal = () => {
    setProjectModalVisible(false);
    setProjectName('');
    setHourlyRateValue('');
  };

  const changeMonth = (direction: 'previous' | 'next') => {
    const nextMonth = addMonths(visibleMonth, direction === 'previous' ? -1 : 1);
    setVisibleMonth(nextMonth);
    setSelectedDate(toDateKey(nextMonth));
  };

  return (
    <>
      <MainLayout
        title="Worked Hours"
        rightAction={
          <View style={styles.actions}>
            <AppIconButton
              accessibilityLabel="Toggle appearance"
              icon={themeMode === 'light' ? 'moon-outline' : 'sunny-outline'}
              onPress={toggleThemeMode}
            />
            <AppIconButton
              accessibilityLabel="Add project"
              icon="add"
              onPress={() => setProjectModalVisible(true)}
            />
          </View>
        }
        contentContainerStyle={styles.content}
      >
        <WorkCalendar
          selectedDate={selectedDate}
          visibleMonth={visibleMonth}
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
          dailyEarnings={dailyEarnings}
          weeklyEarnings={weeklyEarnings}
          monthlyEarnings={monthlyEarnings}
        />

        <DayDetails
          selectedDate={selectedDate}
          projects={projects}
          dayLogs={dayLogs}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onSaveHours={setHoursForProject}
          onClearHours={clearHoursForProject}
        />
      </MainLayout>

      <Modal
        animationType="fade"
        visible={isProjectModalVisible}
        transparent
        onRequestClose={() => setProjectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <AppText variant="title" weight="bold">
              New project
            </AppText>
            <AppInput onChangeText={setProjectName} placeholder="Project name" value={projectName} />
            <AppInput
              keyboardType="decimal-pad"
              onChangeText={setHourlyRateValue}
              placeholder="Hourly rate in EUR"
              value={hourlyRateValue}
            />
            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                onPress={resetProjectModal}
                variant="secondary"
                fullWidth={false}
              />
              <AppButton
                title="Create"
                onPress={() => {
                  if (canCreateProject && parsedHourlyRate !== null) {
                    const project = createProject({ name: projectName, hourlyRate: parsedHourlyRate });

                    if (project) {
                      setSelectedProjectId(project.id);
                      resetProjectModal();
                    }
                  }
                }}
                disabled={!canCreateProject}
                fullWidth={false}
              />
            </View>
            <Pressable
              onPress={resetProjectModal}
              style={styles.closeZone}
              accessibilityRole="button"
            >
              <AppText color="muted" align="center">
                Close
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    maxWidth: 480,
    padding: 20,
    width: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  closeZone: {
    paddingVertical: 4,
  },
});
