import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Project, WorkLog } from '@/types';
import { useAppTheme } from '@/theme';
import { calculateDailyEarnings, formatCurrency, formatLongDate, parseDecimalInput } from '@/utils';

import { AppButton } from '../atoms/AppButton';
import { AppInput } from '../atoms/AppInput';
import { AppText } from '../atoms/AppText';

type ProjectChipsProps = {
  projects: Project[];
  selectedProjectId: string;
  onSelect: (projectId: string) => void;
};

export type DayDetailsProps = {
  selectedDate: string;
  projects: Project[];
  dayLogs: WorkLog[];
  isHoliday: boolean;
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onSaveHours: (projectId: string, hoursWorked: number) => void;
  onClearHours: (projectId: string) => void;
  onToggleHoliday: () => void;
};

function ProjectChips({ projects, selectedProjectId, onSelect }: ProjectChipsProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.projectList}>
      {projects.map((project) => {
        const isSelected = project.id === selectedProjectId;

        return (
          <Pressable
            key={project.id}
            onPress={() => onSelect(project.id)}
            style={[
              styles.projectChip,
              {
                backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceMuted,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <AppText color={isSelected ? 'inverse' : 'text'} weight="semibold">
              {project.name}
            </AppText>
            <AppText color={isSelected ? 'inverse' : 'muted'} variant="bodySmall">
              {formatCurrency(project.hourlyRate)}/h
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function DayDetails({
  selectedDate,
  projects,
  dayLogs,
  isHoliday,
  selectedProjectId,
  onSelectProject,
  onSaveHours,
  onClearHours,
  onToggleHoliday,
}: DayDetailsProps) {
  const theme = useAppTheme();
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId],
  );
  const currentLog = useMemo(
    () => dayLogs.find((log) => log.projectId === selectedProjectId),
    [dayLogs, selectedProjectId],
  );
  const [hoursValue, setHoursValue] = useState('');

  useEffect(() => {
    setHoursValue(currentLog ? String(currentLog.hoursWorked) : '');
  }, [currentLog]);

  useEffect(() => {
    if (!selectedProjectId && projects[0]) {
      onSelectProject(projects[0].id);
    }
  }, [onSelectProject, projects, selectedProjectId]);

  const parsedHours = parseDecimalInput(hoursValue);
  const canSave = Boolean(selectedProjectId) && parsedHours !== null && parsedHours >= 0;
  const currentEarnings =
    currentLog && selectedProject ? calculateDailyEarnings(currentLog, selectedProject) : 0;
  const commitHours = () => {
    if (!canSave || parsedHours === null) {
      return;
    }

    if (parsedHours === 0) {
      onClearHours(selectedProjectId);
      return;
    }

    onSaveHours(selectedProjectId, parsedHours);
  };

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <AppText variant="title" weight="bold">
        {formatLongDate(selectedDate)}
      </AppText>

      {projects.length === 0 ? (
        <AppText color="muted">Create a project from the top-right plus icon to start logging hours.</AppText>
      ) : (
        <>
          <View style={styles.selectionRow}>
            <ProjectChips projects={projects} selectedProjectId={selectedProjectId} onSelect={onSelectProject} />

            <Pressable
              onPress={onToggleHoliday}
              style={[
                styles.holidayButton,
                {
                  backgroundColor: isHoliday ? theme.colors.warning : theme.colors.warningSoft,
                  borderColor: theme.colors.warning,
                },
              ]}
            >
              <AppText
                style={{
                  color: isHoliday ? theme.colors.inverse : theme.colors.warning,
                }}
                weight="semibold"
              >
                Día Festivo
              </AppText>
            </Pressable>
          </View>

          <View style={styles.inputBlock}>
            <AppText variant="bodySmall" color="muted">
              Hours Today
            </AppText>
            <AppInput
              keyboardType="decimal-pad"
              onBlur={commitHours}
              onChangeText={setHoursValue}
              placeholder="0"
              value={hoursValue}
            />
          </View>

          <View style={styles.inlineMeta}>
            <AppText color="muted">
              {selectedProject
                ? `Rate: ${formatCurrency(selectedProject.hourlyRate)}/h`
                : 'Select a project to edit the day.'}
            </AppText>
            <AppText color="muted">Earned: {formatCurrency(currentEarnings)}</AppText>
          </View>

          <View style={styles.buttonRow}>
            <AppButton
              title="Save hours"
              onPress={commitHours}
              disabled={!canSave}
              fullWidth={false}
            />
            <AppButton
              title="Clear"
              onPress={() => onClearHours(selectedProjectId)}
              variant="secondary"
              fullWidth={false}
              disabled={!currentLog}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  projectList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 8,
  },
  projectChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
    minWidth: 140,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectionRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 8,
  },
  inputBlock: {
    gap: 6,
  },
  inlineMeta: {
    gap: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  holidayButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
