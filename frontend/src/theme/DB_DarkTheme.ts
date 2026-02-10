import used from './DB_DarkTheme.used-colors.json';

export type DbDarkTheme = {
  name: 'DB_DarkTheme';
  mode: 'dark';
  usedColors: {
    hex: readonly string[];
    rgb: readonly string[];
    hsl: readonly string[];
    tailwind: readonly string[];
  };
};

export const DB_DarkTheme: DbDarkTheme = {
  name: 'DB_DarkTheme',
  mode: 'dark',
  usedColors: {
    hex: used.unique.hex,
    rgb: used.unique.rgb,
    hsl: used.unique.hsl,
    tailwind: used.unique.tailwind,
  },
} as const;

