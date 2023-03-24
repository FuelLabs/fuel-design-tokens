import { createScales, createAlphaScales } from "./scales.mjs"
import { createIntents } from "./intents.mjs"
import { createSemantics } from "./semantic.mjs"

export function createThemeColors({ isLight }) {
  return {
    ...createSemantics(isLight),
    ...createIntents(),
    ...createScales(isLight),
    ...createAlphaScales(isLight),
  }
}
