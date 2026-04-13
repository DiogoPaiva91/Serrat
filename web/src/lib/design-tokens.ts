/**
 * Tecnopano Design System — Design Tokens
 *
 * Fonte única de verdade para todos os valores de design.
 * As cores são definidas como variáveis CSS (HSL) em index.css.
 * Este arquivo exporta constantes semânticas para uso em componentes TypeScript.
 */

// ─── Cores ───────────────────────────────────────────────────────────────────

export const colors = {
  /** Cores primárias — Amber/Golden */
  primary: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#eab308", // --primary
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    DEFAULT: "#eab308",
  },

  /** Tons neutros */
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },

  /** Semânticas — feedback e status */
  semantic: {
    success: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200", icon: "text-green-600", hex: "#16a34a" },
    warning: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200", icon: "text-amber-600", hex: "#d97706" },
    error: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200", icon: "text-red-600", hex: "#dc2626" },
    info: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", icon: "text-blue-600", hex: "#2563eb" },
  },

  /** Cores para gráficos */
  chart: {
    blue: "#3b82f6",
    teal: "#14b8a6",
    yellow: "#eab308",
    purple: "#a855f7",
    rose: "#f43f5e",
  },
} as const;

// ─── Tipografia ──────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  /** Escala tipográfica com Tailwind classes */
  scale: {
    xs: { class: "text-xs", size: "0.75rem", lineHeight: "1rem" },
    sm: { class: "text-sm", size: "0.875rem", lineHeight: "1.25rem" },
    base: { class: "text-base", size: "1rem", lineHeight: "1.5rem" },
    lg: { class: "text-lg", size: "1.125rem", lineHeight: "1.75rem" },
    xl: { class: "text-xl", size: "1.25rem", lineHeight: "1.75rem" },
    "2xl": { class: "text-2xl", size: "1.5rem", lineHeight: "2rem" },
    "3xl": { class: "text-3xl", size: "1.875rem", lineHeight: "2.25rem" },
    "4xl": { class: "text-4xl", size: "2.25rem", lineHeight: "2.5rem" },
  },
  /** Padrões tipográficos do Design System */
  patterns: {
    pageTitle: "text-xl font-semibold text-foreground",
    sectionTitle: "text-lg font-semibold leading-none tracking-tight",
    cardTitle: "text-lg font-semibold leading-none tracking-tight",
    label: "text-sm font-medium",
    body: "text-sm text-foreground",
    bodyMuted: "text-sm text-muted-foreground",
    caption: "text-xs text-muted-foreground",
    statValue: "text-2xl font-bold",
    statLabel: "text-sm font-medium text-muted-foreground",
  },
} as const;

// ─── Espaçamento ─────────────────────────────────────────────────────────────

export const spacing = {
  /** Escala base (em rem, equivale ao Tailwind) */
  scale: {
    px: "1px",
    0.5: "0.125rem", // 2px
    1: "0.25rem",     // 4px
    1.5: "0.375rem",  // 6px
    2: "0.5rem",      // 8px
    3: "0.75rem",     // 12px
    4: "1rem",        // 16px
    5: "1.25rem",     // 20px
    6: "1.5rem",      // 24px
    8: "2rem",        // 32px
    10: "2.5rem",     // 40px
    12: "3rem",       // 48px
    16: "4rem",       // 64px
  },
  /** Padrões de espaçamento de layout */
  layout: {
    pagePadding: "p-6",
    cardPadding: "p-6",
    cardContentPadding: "p-6 pt-0",
    sectionGap: "gap-6",
    componentGap: "gap-4",
    inlineGap: "gap-2",
    stackGap: "space-y-4",
    headerHeight: "h-16",
    sidebarWidth: "w-[260px]",
    sidebarCollapsed: "w-20",
  },
} as const;

// ─── Raio de Borda ───────────────────────────────────────────────────────────

export const radius = {
  none: "rounded-none",
  sm: "rounded-sm",     // 4px
  DEFAULT: "rounded-md", // 6px
  md: "rounded-md",     // 6px
  lg: "rounded-lg",     // 8px  — padrão do DS (--radius)
  xl: "rounded-xl",     // 12px
  "2xl": "rounded-2xl", // 16px
  full: "rounded-full", // pill
} as const;

// ─── Sombras ─────────────────────────────────────────────────────────────────

export const shadows = {
  none: "shadow-none",
  sm: "shadow-sm",       // cards em repouso
  DEFAULT: "shadow",     // elevação leve
  md: "shadow-md",       // cards em hover
  lg: "shadow-lg",       // modais/dropdowns
  xl: "shadow-xl",       // diálogos
} as const;

// ─── Animações ───────────────────────────────────────────────────────────────

export const animation = {
  /** Transições padrão */
  transition: {
    fast: "transition-all duration-150",
    DEFAULT: "transition-all duration-200",
    slow: "transition-all duration-300",
    colors: "transition-colors duration-200",
    shadow: "transition-shadow duration-200",
    transform: "transition-transform duration-200",
  },
  /** Easing */
  easing: {
    DEFAULT: "ease-in-out",
    in: "ease-in",
    out: "ease-out",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
  /** Framer Motion presets */
  framer: {
    fadeInUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } },
    fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } },
    scaleIn: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.2 } },
    slideInRight: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3 } },
    stagger: (index: number, delay = 0.1) => ({ transition: { delay: index * delay } }),
  },
} as const;

// ─── Breakpoints ─────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ─── Z-Index ─────────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  header: 30,
  sidebar: 40,
  overlay: 50,
  modal: 50,
  popover: 60,
  toast: 70,
} as const;

// ─── Ícones ──────────────────────────────────────────────────────────────────

export const iconSizes = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  DEFAULT: "h-5 w-5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

// ─── Componentes — Classes Compostas ─────────────────────────────────────────

export const componentStyles = {
  /** Foco visível acessível */
  focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

  /** Card padrão */
  card: "rounded-lg border bg-card text-card-foreground shadow-sm",
  cardHover: "rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200",

  /** Input padrão */
  input: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",

  /** Overlay de modal */
  overlay: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",

  /** Container de ícone decorativo */
  iconContainer: (bg: string) => `w-12 h-12 rounded-lg flex items-center justify-center ${bg}`,
  iconContainerSm: (bg: string) => `w-10 h-10 rounded-full flex items-center justify-center ${bg}`,

  /** Avatar */
  avatar: "rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center",
  avatarText: "text-primary font-bold",
} as const;
