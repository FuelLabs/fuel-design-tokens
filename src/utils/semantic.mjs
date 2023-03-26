import { createColor } from './helpers.mjs';

function inputColor(name) {
  return {
    color: createColor(`{intents.base.11}`),
    placeholder: createColor(`{intents.base.8}`),
    border: createColor(`{intents.${name}.7}`),
    bg: createColor(`{intents.base.3}`),
    icon: createColor(`{intents.${name}.9}`),
  };
}

function isIntentLight(name) {
  return name === 'warning' || name === 'success' || name === 'primary';
}

const categories = {
  solid(name) {
    const isLight = isIntentLight(name);
    return {
      bg: createColor(isLight ? `{intents.${name}.8}` : `{intents.${name}.9}`),
      border: createColor('transparent'),
      color: createColor(`{intents.${name}.1}`),
      icon: createColor(`{intents.${name}.1}`),
      placeholder: createColor(
        !isLight ? `{intents.${name}.2}` : `{intents.${name}.11}`
      ),
      'hover-bg': createColor(
        isLight ? `{intents.${name}.11}` : `{intents.${name}.10}`
      ),
      'hover-border': createColor('transparent'),
      'hover-color': createColor(`{intents.${name}.1}`),
      'hover-icon': createColor(`{intents.${name}.1}`),
      'hover-placeholder': createColor(
        !isLight ? `{intents.${name}.3}` : `{intents.${name}.10}`
      ),
    };
  },
  ghost(name) {
    return {
      bg: createColor(`{intents.${name}.4}`),
      border: createColor(`{intents.${name}.4}`),
      color: createColor(`{intents.${name}.12}`),
      icon: createColor(`{intents.${name}.8}`),
      placeholder: createColor(`{intents.${name}.8}`),
      'hover-bg': createColor(`{intents.${name}.5}`),
      'hover-border': createColor(`{intents.${name}.5}`),
      'hover-color': createColor(`{intents.${name}.12}`),
      'hover-icon': createColor(`{intents.${name}.8}`),
      'hover-placeholder': createColor(`{intents.${name}.9}`),
    };
  },
  outlined(name) {
    const isLight = isIntentLight(name);
    return {
      bg: createColor(`{body-bg}`),
      border: createColor(`{intents.${name}.8}`),
      color: createColor(
        isLight ? `{intents.${name}.8}` : `{intents.${name}.11}`
      ),
      icon: createColor(`{intents.${name}.10}`),
      placeholder: createColor(`{intents.${name}.8}`),
      'hover-bg': createColor(`{body-bg}`),
      'hover-border': createColor(`{intents.${name}.8}`),
      'hover-color': createColor(`{intents.${name}.12}`),
      'hover-icon': createColor(`{intents.${name}.10}`),
      'hover-placeholder': createColor(`{intents.${name}.9}`),
    };
  },
  link(name) {
    const isLight = isIntentLight(name);
    return {
      bg: createColor(`{body-bg}`),
      color: createColor(
        isLight ? `{intents.${name}.11}` : `{intents.${name}.9}`
      ),
      icon: createColor(
        isLight ? `{intents.${name}.11}` : `{intents.${name}.9}`
      ),
      placeholder: createColor(`{intents.${name}.8}`),
      border: createColor(`{body-bg}`),
      'hover-bg': createColor(`{body-bg}`),
      'hover-border': createColor(`{body-bg}`),
      'hover-color': createColor(
        isLight ? `{intents.${name}.11}` : `{intents.${name}.9}`
      ),
      'hover-icon': createColor(
        isLight ? `{intents.${name}.11}` : `{intents.${name}.9}`
      ),
      'hover-placeholder': createColor(`{intents.${name}.8}`),
    };
  },
};

function semanticCategory(name) {
  return {
    base: categories[name]('base'),
    primary: categories[name]('primary'),
    secondary: categories[name]('secondary'),
    info: categories[name]('info'),
    warning: categories[name]('warning'),
    success: categories[name]('success'),
    error: categories[name]('error'),
  };
}

export function createSemantics(isLight) {
  return {
    white: createColor('#ffffff'),
    black: createColor('#000000'),
    'body-bg': createColor(isLight ? '{scales.gray.1}' : '{black}'),
    'body-inverse': createColor(isLight ? '{black}' : '{scales.gray.1}'),
    'card-bg': createColor('{scales.gray.3}'),
    border: createColor('{scales.gray.6}'),
    brand: createColor('{intents.primary.9}'),
    text: {
      body: createColor('{intents.base.11}'),
      heading: createColor('{intents.base.12}'),
      subtext: createColor('{intents.base.10}'),
      muted: createColor('{intents.base.9}'),
      icon: createColor('{intents.base.6}'),
      inverse: createColor('{intents.base.12}'),
      active: createColor('{intents.base.12}'),
      link: createColor('{intents.primary.10}'),
      'link-active': createColor('{intents.primary.10}'),
      'link-visited': createColor('{intents.primary.10}'),
      'link-hover': createColor('{intents.primary.11}'),
      'link-disabled': createColor('{intents.primary.7}'),
    },
    input: {
      disabled: {
        color: createColor('{intents.base.6}'),
        placeholder: createColor('{intents.base.6}'),
        border: createColor('{intents.base.6}'),
        bg: createColor('{intents.base.1}'),
        icon: createColor('{intents.base.6}'),
      },
      base: inputColor('base'),
      success: inputColor('success'),
      error: inputColor('error'),
    },
    semantic: {
      solid: semanticCategory('solid'),
      ghost: semanticCategory('ghost'),
      outlined: semanticCategory('outlined'),
      link: semanticCategory('link'),
    },
  };
}
