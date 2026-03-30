import type { AppLanguage } from '@/types';

type TranslationTree = {
  [key: string]: string | TranslationTree;
};

export const translations: Record<AppLanguage, TranslationTree> = {
  en: {
    header: {
      home: 'Worked Hours',
      settings: 'Settings',
      openSettings: 'Open settings',
      goBack: 'Go back',
    },
    calendar: {
      previousMonth: 'Previous month',
      nextMonth: 'Next month',
    },
    common: {
      cancel: 'Cancel',
      clear: 'Clear',
      close: 'Close',
      create: 'Create',
      delete: 'Delete',
      edit: 'Edit',
      loadingSavedData: 'Loading saved data...',
      reset: 'Reset',
      save: 'Save',
      update: 'Update',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      english: 'English',
      spanish: 'Spanish',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      weekStart: 'Start of week',
      monday: 'Monday',
      sunday: 'Sunday',
      resetData: 'Reset data',
      resetDescription: 'This clears projects, work logs, and holiday marks.',
      resetConfirmTitle: 'Reset data?',
      resetConfirmBody: 'This will remove all projects, worked hours, and holiday days from the device.',
    },
    summary: {
      hoursToday: 'Hours today',
      todayEarnings: 'Today earnings',
      weekEarnings: 'Week earnings',
      monthEarnings: 'Month earnings',
    },
    day: {
      holiday: 'Holiday',
      hoursToday: 'Hours today',
      saveHours: 'Save hours',
      noProjects: 'Create a project in the projects section to start logging hours.',
      selectProject: 'Select a project to edit the day.',
      rate: 'Rate: {value}/h',
      earned: 'Earned: {value}',
    },
    projects: {
      manage: 'Manage projects',
      hide: 'Hide projects',
      title: 'Projects',
      createTitle: 'Create project',
      editTitle: 'Edit project',
      saveProject: 'Save project',
      updateProject: 'Update project',
      projectName: 'Project name',
      hourlyRatePlaceholder: 'Hourly rate in {currency}',
      ratePreview: 'Rate preview: {value}/h',
      currency: 'Currency',
      startDate: 'Start date',
      contractType: 'Contract type',
      contractFile: 'Contract file',
      replaceFile: 'Replace file',
      uploadContract: 'Upload contract',
      noContract: 'No contract uploaded.',
      pdfAttached: 'PDF attached',
      openPdf: 'Open PDF',
      openFile: 'Open file',
      noProjects: 'No projects yet.',
      started: 'Started {date}',
      deleteTitle: 'Delete project?',
      deleteBody: 'This will remove "{name}" and all of its logged hours.',
      deleteFallback: 'This action cannot be undone.',
      fullTime: 'Full-time',
      partTime: 'Part-time',
      temporary: 'Temporary',
      freelance: 'Freelance',
      hourly: 'Hourly',
    },
  },
  es: {
    header: {
      home: 'Horas trabajadas',
      settings: 'Configuración',
      openSettings: 'Abrir configuración',
      goBack: 'Volver',
    },
    calendar: {
      previousMonth: 'Mes anterior',
      nextMonth: 'Mes siguiente',
    },
    common: {
      cancel: 'Cancelar',
      clear: 'Limpiar',
      close: 'Cerrar',
      create: 'Crear',
      delete: 'Eliminar',
      edit: 'Editar',
      loadingSavedData: 'Cargando datos guardados...',
      reset: 'Restablecer',
      save: 'Guardar',
      update: 'Actualizar',
    },
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      english: 'Inglés',
      spanish: 'Español',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
      weekStart: 'Inicio de la semana',
      monday: 'Lunes',
      sunday: 'Domingo',
      resetData: 'Restablecer datos',
      resetDescription: 'Esto elimina los proyectos, los registros de horas y los días festivos marcados.',
      resetConfirmTitle: '¿Restablecer datos?',
      resetConfirmBody: 'Esto eliminará todos los proyectos, las horas registradas y los días festivos del dispositivo.',
    },
    summary: {
      hoursToday: 'Horas de hoy',
      todayEarnings: 'Ganancias de hoy',
      weekEarnings: 'Ganancias de la semana',
      monthEarnings: 'Ganancias del mes',
    },
    day: {
      holiday: 'Día festivo',
      hoursToday: 'Horas de hoy',
      saveHours: 'Guardar horas',
      noProjects: 'Crea un proyecto en la sección de proyectos para empezar a registrar horas.',
      selectProject: 'Selecciona un proyecto para editar el día.',
      rate: 'Tarifa: {value}/h',
      earned: 'Ganado: {value}',
    },
    projects: {
      manage: 'Gestionar proyectos',
      hide: 'Ocultar proyectos',
      title: 'Proyectos',
      createTitle: 'Crear proyecto',
      editTitle: 'Editar proyecto',
      saveProject: 'Guardar proyecto',
      updateProject: 'Actualizar proyecto',
      projectName: 'Nombre del proyecto',
      hourlyRatePlaceholder: 'Tarifa por hora en {currency}',
      ratePreview: 'Vista previa de tarifa: {value}/h',
      currency: 'Moneda',
      startDate: 'Fecha de inicio',
      contractType: 'Tipo de contrato',
      contractFile: 'Archivo del contrato',
      replaceFile: 'Reemplazar archivo',
      uploadContract: 'Subir contrato',
      noContract: 'No hay contrato subido.',
      pdfAttached: 'PDF adjunto',
      openPdf: 'Abrir PDF',
      openFile: 'Abrir archivo',
      noProjects: 'Todavía no hay proyectos.',
      started: 'Inicio: {date}',
      deleteTitle: '¿Eliminar proyecto?',
      deleteBody: 'Esto eliminará "{name}" y todas sus horas registradas.',
      deleteFallback: 'Esta acción no se puede deshacer.',
      fullTime: 'Tiempo completo',
      partTime: 'Tiempo parcial',
      temporary: 'Temporal',
      freelance: 'Freelance',
      hourly: 'Por horas',
    },
  },
};

function getValue(tree: TranslationTree, path: string) {
  return path.split('.').reduce<string | TranslationTree | undefined>((currentValue, key) => {
    if (!currentValue || typeof currentValue === 'string') {
      return currentValue;
    }

    return currentValue[key];
  }, tree);
}

export function translate(language: AppLanguage, key: string, params?: Record<string, string | number>) {
  const selectedValue = getValue(translations[language], key);
  const fallbackValue = getValue(translations.en, key);
  const resolvedValue = typeof selectedValue === 'string' ? selectedValue : typeof fallbackValue === 'string' ? fallbackValue : key;

  if (!params) {
    return resolvedValue;
  }

  return Object.entries(params).reduce((text, [paramKey, paramValue]) => {
    return text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
  }, resolvedValue);
}
