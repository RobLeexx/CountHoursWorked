import { useMemo, useState } from 'react';
import { Image, Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import { useAppContext } from '@/context';
import type { ContractFile, ContractType, CreateProjectInput, CurrencyCode, Project, UpdateProjectInput } from '@/types';
import { useAppTheme } from '@/theme';
import { formatCurrency, formatDate, fromDateKey, parseDecimalInput, toDateKey } from '@/utils';

import { AppButton } from '../atoms/AppButton';
import { AppInput } from '../atoms/AppInput';
import { AppText } from '../atoms/AppText';
import { DateField } from '../molecules/DateField';

const CONTRACT_TYPES: ContractType[] = ['hourly', 'temporary', 'part-time', 'full-time', 'freelance'];
const CURRENCIES: CurrencyCode[] = ['EUR', 'USD'];

type ContractTypeSelectorProps = {
  value: ContractType;
  onChange: (value: ContractType) => void;
};

type ProjectFormValues = {
  name: string;
  hourlyRate: string;
  currency: CurrencyCode;
  contractType: ContractType;
  startDate: string;
  contractFile?: ContractFile;
};

type ProjectFormProps = {
  title: string;
  submitLabel: string;
  initialValues: ProjectFormValues;
  onSubmit: (values: CreateProjectInput | UpdateProjectInput) => void;
  onCancel?: () => void;
};

export type ProjectsManagerProps = {
  projects: Project[];
  onCreateProject: (input: CreateProjectInput) => Project | null;
  onUpdateProject: (id: string, updates: UpdateProjectInput) => void;
  onDeleteProject: (id: string) => void;
  defaultOpen?: boolean;
  showToggle?: boolean;
};

function ContractTypeSelector({ value, onChange }: ContractTypeSelectorProps) {
  const { t } = useAppContext();
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
              {t(`projects.${type}`)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function ContractPreview({ contractFile }: { contractFile?: ContractFile }) {
  const { t } = useAppContext();
  const theme = useAppTheme();

  if (!contractFile) {
    return (
      <AppText color="muted" variant="bodySmall">
        {t('projects.noContract')}
      </AppText>
    );
  }

  const isImage = contractFile.mimeType.startsWith('image/');
  const isPdf = contractFile.mimeType === 'application/pdf';

  return (
    <View style={styles.previewBlock}>
      <AppText variant="bodySmall" weight="semibold">
        {contractFile.name}
      </AppText>
      {isImage ? (
        <Image source={{ uri: contractFile.uri }} style={styles.previewImage} resizeMode="cover" />
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
          <AppText color="muted">{t('projects.pdfAttached')}</AppText>
        </View>
      ) : null}
      <AppButton
        title={isPdf ? t('projects.openPdf') : t('projects.openFile')}
        onPress={() => {
          void Linking.openURL(contractFile.uri);
        }}
        variant="secondary"
        fullWidth={false}
      />
    </View>
  );
}

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

function ProjectForm({ title, submitLabel, initialValues, onSubmit, onCancel }: ProjectFormProps) {
  const { locale, t } = useAppContext();
  const theme = useAppTheme();
  const [name, setName] = useState(initialValues.name);
  const [hourlyRate, setHourlyRate] = useState(initialValues.hourlyRate);
  const [currency, setCurrency] = useState<CurrencyCode>(initialValues.currency);
  const [contractType, setContractType] = useState<ContractType>(initialValues.contractType);
  const [startDate, setStartDate] = useState(initialValues.startDate);
  const [contractFile, setContractFile] = useState<ContractFile | undefined>(initialValues.contractFile);

  const parsedRate = parseDecimalInput(hourlyRate);
  const canSubmit = Boolean(name.trim()) && parsedRate !== null && parsedRate > 0;

  return (
    <View
      style={[
        styles.formCard,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <AppText variant="title" weight="bold">
        {title}
      </AppText>

      <AppInput onChangeText={setName} placeholder={t('projects.projectName')} value={name} />
      <AppInput
        keyboardType="decimal-pad"
        onChangeText={setHourlyRate}
        placeholder={t('projects.hourlyRatePlaceholder', { currency })}
        value={hourlyRate}
      />
      {parsedRate ? (
        <AppText color="muted" variant="bodySmall">
          {t('projects.ratePreview', { value: formatCurrency(parsedRate, locale, currency) })}
        </AppText>
      ) : null}
      <View style={styles.fieldBlock}>
        <AppText variant="bodySmall" color="muted">
          {t('projects.currency')}
        </AppText>
        <View style={styles.typeList}>
          {CURRENCIES.map((option) => {
            const isSelected = option === currency;

            return (
              <Pressable
                key={option}
                onPress={() => setCurrency(option)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceMuted,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <AppText color={isSelected ? 'inverse' : 'text'} variant="bodySmall" weight="semibold">
                  {option}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
      <DateField label={t('projects.startDate')} onChange={setStartDate} value={startDate} />

      <View style={styles.fieldBlock}>
        <AppText variant="bodySmall" color="muted">
          {t('projects.contractType')}
        </AppText>
        <ContractTypeSelector value={contractType} onChange={setContractType} />
      </View>

      <View style={styles.fieldBlock}>
        <AppText variant="bodySmall" color="muted">
          {t('projects.contractFile')}
        </AppText>
        <AppButton
          title={contractFile ? t('projects.replaceFile') : t('projects.uploadContract')}
          onPress={async () => {
            const file = await pickContractFile();

            if (file) {
              setContractFile(file);
            }
          }}
          variant="secondary"
          fullWidth={false}
        />
        <ContractPreview contractFile={contractFile} />
      </View>

      <View style={styles.formActions}>
        {onCancel ? <AppButton title={t('common.cancel')} onPress={onCancel} variant="secondary" fullWidth={false} /> : null}
        <AppButton
          title={submitLabel}
          onPress={() => {
            if (canSubmit && parsedRate !== null) {
              onSubmit({
                name,
                hourlyRate: parsedRate,
                currency,
                contractType,
                startDate,
                contractFile,
              });
            }
          }}
          disabled={!canSubmit}
          fullWidth={false}
        />
      </View>
    </View>
  );
}

export function ProjectsManager({
  projects,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  defaultOpen = false,
  showToggle = true,
}: ProjectsManagerProps) {
  const { locale, t } = useAppContext();
  const theme = useAppTheme();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectPendingDelete, setProjectPendingDelete] = useState<Project | null>(null);
  const editingProject = useMemo(
    () => projects.find((project) => project.id === editingProjectId),
    [editingProjectId, projects],
  );

  return (
    <View style={styles.wrapper}>
      {showToggle ? (
        <AppButton
          title={isOpen ? t('projects.hide') : t('projects.manage')}
          onPress={() => setIsOpen((currentValue) => !currentValue)}
          variant="secondary"
          fullWidth={false}
        />
      ) : null}

      {isOpen ? (
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
            {t('projects.title')}
          </AppText>

          <ProjectForm
            title={t('projects.createTitle')}
            submitLabel={t('projects.saveProject')}
            initialValues={{
              name: '',
              hourlyRate: '',
              currency: 'EUR',
              contractType: 'hourly',
              startDate: toDateKey(new Date()),
            }}
            onSubmit={(values) => {
              const project = onCreateProject(values as CreateProjectInput);

              if (project) {
                setEditingProjectId(null);
              }
            }}
          />

          {projects.length === 0 ? (
            <AppText color="muted">{t('projects.noProjects')}</AppText>
          ) : (
            projects.map((project) => {
              const isEditing = project.id === editingProjectId;

              return (
                <View
                  key={project.id}
                  style={[
                    styles.projectCard,
                    {
                      backgroundColor: theme.colors.surfaceMuted,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.projectCardHeader}>
                    <View style={styles.projectMeta}>
                      <AppText weight="bold">{project.name}</AppText>
                      <AppText color="muted" variant="bodySmall">
                        {formatCurrency(project.hourlyRate, locale, project.currency)}/h | {project.currency} | {t(`projects.${project.contractType}`)} | {t('projects.started', {
                          date: formatDate(fromDateKey(project.startDate), locale),
                        })}
                      </AppText>
                    </View>
                    <View style={styles.projectButtons}>
                      <AppButton
                        title={isEditing ? t('common.close') : t('common.edit')}
                        onPress={() => setEditingProjectId(isEditing ? null : project.id)}
                        variant="secondary"
                        fullWidth={false}
                      />
                      <AppButton
                        title={t('common.delete')}
                        onPress={() => setProjectPendingDelete(project)}
                        variant="ghost"
                        fullWidth={false}
                      />
                    </View>
                  </View>

                  <ContractPreview contractFile={project.contractFile} />

                  {isEditing && editingProject ? (
                    <ProjectForm
                      key={editingProject.id}
                      title={t('projects.editTitle')}
                      submitLabel={t('projects.updateProject')}
                      initialValues={{
                        name: editingProject.name,
                        hourlyRate: String(editingProject.hourlyRate),
                        currency: editingProject.currency,
                        contractType: editingProject.contractType,
                        startDate: editingProject.startDate,
                        contractFile: editingProject.contractFile,
                      }}
                      onSubmit={(values) => {
                        onUpdateProject(project.id, values as UpdateProjectInput);
                        setEditingProjectId(null);
                      }}
                      onCancel={() => setEditingProjectId(null)}
                    />
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      ) : null}

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(projectPendingDelete)}
        onRequestClose={() => setProjectPendingDelete(null)}
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
              {t('projects.deleteTitle')}
            </AppText>
            <AppText color="muted">
              {projectPendingDelete
                ? t('projects.deleteBody', { name: projectPendingDelete.name })
                : t('projects.deleteFallback')}
            </AppText>
            <View style={styles.modalActions}>
              <AppButton
                title={t('common.cancel')}
                onPress={() => setProjectPendingDelete(null)}
                variant="secondary"
                fullWidth={false}
              />
              <AppButton
                title={t('common.delete')}
                onPress={() => {
                  if (projectPendingDelete) {
                    if (editingProjectId === projectPendingDelete.id) {
                      setEditingProjectId(null);
                    }

                    onDeleteProject(projectPendingDelete.id);
                    setProjectPendingDelete(null);
                  }
                }}
                fullWidth={false}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  section: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  fieldBlock: {
    gap: 8,
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
  previewBlock: {
    gap: 8,
  },
  previewImage: {
    borderRadius: 14,
    height: 180,
    width: '100%',
  },
  pdfPreview: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 120,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
  },
  projectCard: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  projectCardHeader: {
    gap: 12,
  },
  projectMeta: {
    gap: 4,
  },
  projectButtons: {
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
    maxWidth: 420,
    padding: 20,
    width: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
});
