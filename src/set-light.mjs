import { copyToFigma, createThemeColors } from './utils/index.mjs';

copyToFigma('dark', createThemeColors({ isLight: true }));
