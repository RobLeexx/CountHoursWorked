import { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import type { ContractFile, ContractType } from '@/types';

import {
  AppButton,
  DateField,
  AppIconButton,
  AppInput,
  AppText,
  DayDetails,
  MainLayout,
  ProjectsManager,
  Summary,
  WorkCalendar,
} from '@/components';
import { useAppContext } from '@/context';
import { useAppTheme } from '@/theme';
import { useProjects, useWorkLogs } from '@/hooks';
import { addMonths, formatCurrency, fromDateKey, parseDecimalInput, toDateKey } from '@/utils';

const CONTRACT_TYPES: ContractType[] = ['hourly', 'temporary', 'part-time', 'full-time', 'freelance'];

async function pickContractFile() {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ['image/*', 'application/pdf'],
  });

  if (result.canceled) {
    return undefined;
  }

  const asset = result.assets[0];

  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? 'application/octet-stream',
  } satisfies ContractFile;
}

function ContractTypeSelector({
  value,
  onChange,
}: {
  value: ContractType;
  onChange: (value: ContractType) => void;
}) {
  const theme = useAppTheme();

  return (
    <View style={styles.typeList}>
      {CONTRACT_TYPES.map((type) => {
        const isSelected = type === value;

        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            style={[
              styles.typeChip,
              {
                backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceMuted,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <AppText color={isSelected ? 'inverse' : 'text'} variant="bodySmall" weight="semibold">
              {type}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function ContractFilePreview({ contractFile }: { contractFile?: ContractFile }) {
  const theme = useAppTheme();

  if (!contractFile) {
    return null;
  }

  const isImage = contractFile.mimeType.startsWith('image/');
  const isPdf = contractFile.mimeType === 'application/pdf';

  return (
    <View style={styles.contractPreview}>
      <AppText variant="bodySmall" weight="semibold">
        {contractFile.name}
      </AppText>
      {isImage ? (
        <Image source={{ uri: contractFile.uri }} style={styles.contractPreviewImage} resizeMode="cover" />
      ) : null}
      {isPdf ? (
        <View
          style={[
            styles.pdfPreview,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceMuted,
            },
          ]}
        >
          <AppText color="muted">PDF attached</AppText>
        </View>
      ) : null}
      <AppButton
        title={isPdf ? 'Open PDF' : 'Open file'}
        onPress={() => {
          void Linking.openURL(contractFile.uri);
        }}
        variant="secondary"
        fullWidth={false}
      />
    </View>
  );
}

export function HomeScreen() {
  const theme = useAppTheme();
  const { holidayDates, isHydrated, themeMode, toggleThemeMode, toggleHoliday } = useAppContext();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isProjectModalVisible, setProjectModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [hourlyRateValue, setHourlyRateValue] = useState('');
  const [contractType, setContractType] = useState<ContractType>('hourly');
  const [startDate, setStartDate] = useState(toDateKey(today));
  const [contractFile, setContractFile] = useState<ContractFile | undefined>();
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
    if (projects.length === 0) {
      setSelectedProjectId('');
      return;
    }

    if (!projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const parsedHourlyRate = parseDecimalInput(hourlyRateValue);
  const canCreateProject = Boolean(projectName.trim()) && parsedHourlyRate !== null && parsedHourlyRate > 0;
  const resetProjectModal = () => {
    setProjectModalVisible(false);
    setProjectName('');
    setHourlyRateValue('');
    setContractType('hourly');
    setStartDate(toDateKey(new Date()));
    setContractFile(undefined);
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
        {!isHydrated ? <AppText color="muted">Loading saved data...</AppText> : null}

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
          dailyEarnings={dailyEarnings}
          weeklyEarnings={weeklyEarnings}
          monthlyEarnings={monthlyEarnings}
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
            <DateField label="Start date" onChange={setStartDate} value={startDate} />
            <View style={styles.modalSection}>
              <AppText variant="bodySmall" color="muted">
                Contract type
              </AppText>
              <ContractTypeSelector value={contractType} onChange={setContractType} />
            </View>
            <View style={styles.modalSection}>
              <AppText variant="bodySmall" color="muted">
                Contract file
              </AppText>
              <AppButton
                title={contractFile ? 'Replace file' : 'Upload contract'}
                onPress={async () => {
                  const file = await pickContractFile();

                  if (file) {
                    setContractFile(file);
                  }
                }}
                variant="secondary"
                fullWidth={false}
              />
              <ContractFilePreview contractFile={contractFile} />
            </View>
            <AppText color="muted" variant="bodySmall">
              {parsedHourlyRate ? `Rate preview: ${formatCurrency(parsedHourlyRate)}/h` : 'Set the hourly rate in EUR.'}
            </AppText>
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
                    const project = createProject({
                      name: projectName,
                      hourlyRate: parsedHourlyRate,
                      contractType,
                      startDate,
                      contractFile,
                    });

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
  modalSection: {
    gap: 8,
  },
  closeZone: {
    paddingVertical: 4,
  },
  typeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  contractPreview: {
    gap: 8,
  },
  contractPreviewImage: {
    borderRadius: 14,
    height: 160,
    width: '100%',
  },
  pdfPreview: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 96,
  },
});
