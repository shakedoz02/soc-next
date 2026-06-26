// Central onboarding config — edit copy and step targets here.

export const TOUR_STEPS = [
  {
    id: 'scenarios',
    tourId: 'scenarios-grid',
    title: 'תרחישי תקיפה',
    description:
      'כאן תמצא את כל תרחישי הסייבר. בחר תרחיש ולחץ "התחל חקירה" כדי להיכנס ללאב.',
    placement: 'bottom',
  },
  {
    id: 'alerts',
    tourId: 'nav-alerts',
    title: 'תור ההתראות',
    description:
      'סימולציה של עבודת SOC אמיתית — קבל ותחקור התראות אבטחה בזמן אמת.',
    placement: 'left',
  },
  {
    id: 'xp',
    tourId: 'xp-progress',
    title: 'XP והתקדמות',
    description:
      'כל חקירה שתשלים מרוויחה XP ומקדמת אותך לדרגה הבאה. שאפו לדיוק מקסימלי.',
    placement: 'bottom',
  },
  {
    id: 'profile',
    tourId: 'nav-profile',
    title: 'הפרופיל שלך',
    description:
      'עקוב אחר הישגיך, דירוגך, ורשימת החקירות שהשלמת.',
    placement: 'left',
  },
];

export const ROLE_OPTIONS = [
  { id: 'student',  label: 'סטודנט',         icon: 'school' },
  { id: 'analyst',  label: 'אנליסט SOC',      icon: 'security' },
  { id: 'engineer', label: 'מהנדס אבטחה',     icon: 'engineering' },
  { id: 'other',    label: 'אחר',              icon: 'person' },
];

export const GOAL_OPTIONS = [
  { id: 'learn',    label: 'ללמוד אבטחת סייבר',   icon: 'menu_book' },
  { id: 'practice', label: 'להתאמן על תרחישים',    icon: 'fitness_center' },
  { id: 'cert',     label: 'להתכונן לתעודה',       icon: 'workspace_premium' },
  { id: 'fun',      label: 'סתם לכיף',             icon: 'emoji_emotions' },
];

export const CHECKLIST_ITEMS = [
  {
    id: 'startScenario',
    label: 'התחל חקירה ראשונה',
    description: 'בחר תרחיש מהלובי ולחץ "התחל חקירה"',
    icon: 'play_arrow',
  },
  {
    id: 'completeInvestigation',
    label: 'השלם חקירה מלאה',
    description: 'עקוב אחר הפלייבוק וסגור את הכרטיס',
    icon: 'task_alt',
  },
  {
    id: 'visitProfile',
    label: 'בקר בפרופיל שלך',
    description: 'ראה את הדרגה וההישגים שלך',
    icon: 'account_circle',
  },
];

export const LS_KEY = 'soc_onboarding_v1';
