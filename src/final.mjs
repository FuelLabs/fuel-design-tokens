import { copyToFigma, createThemeColors } from "./utils/index.mjs"
import { globalConfig } from "./theme-global.mjs"

const tokens = {
  dark: createThemeColors({ isLight: false }),
  light: createThemeColors({ isLight: true }),
  global: globalConfig,
}

copyToFigma(tokens)
