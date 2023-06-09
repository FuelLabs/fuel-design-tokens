import chroma from 'chroma-js';
import _ from 'lodash';
import fs from 'node:fs';
import path from 'path';
import * as url from 'url';

function readJSON(filepath) {
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  const file = fs.readFileSync(path.join(__dirname, filepath), 'utf-8');
  return JSON.parse(file);
}

function parsePath(obj, set) {
  const res = Object.entries(obj).reduce((acc, [key, value]) => {
    if (key.includes(' / ')) {
      key = key.replace(' / ', '.');
    }

    if (value?.type === 'border') {
      const val = value.value;
      value.value = `${val.width} ${val.style} ${val.color}`;
    }
    if (typeof value === 'object') {
      acc[key] = {
        ...parsePath(value, set ? `${set}.${key}` : key),
        ...value,
        __path: set ? `${set}.${key}` : key,
      };
    }
    return acc;
  }, obj);

  delete res['component-wrapper'];
  return res;
}

function addCSSVariables(obj, vars) {
  return Object.entries(obj).reduce((acc, [, value]) => {
    if (typeof value?.value === 'string') {
      const val = value.value.replace(' / ', '.');
      acc[value.__path] = val;
    }
    if (typeof value?.value === 'object') {
      Object.entries(value.value).forEach(([key, val]) => {
        if (key.includes('__path')) return;
        if (typeof val === 'string') {
          acc[`${value.__path}.${key}`] = val;
        }
      });
    }
    if (typeof value === 'object') {
      addCSSVariables(value, acc);
    }
    return acc;
  }, vars);
}

function adjustThemeOnVars(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const groups = key.match(/^(\w+).(\w+)./);

    if (groups?.[1] === 'radix') {
      delete acc[key];
      key = key.replace('radix', 'colors');
      acc[key] = value;
    }

    if (groups?.[2] === 'scales') {
      acc[key] = value.replace('{', `{colors.`);
    }

    if (
      (groups?.[1] === 'light' || groups?.[1] === 'dark') &&
      groups?.[2] !== 'scales' &&
      value.startsWith('{')
    ) {
      acc[key] = value.replace('{', `{${groups[1]}.`);
    }

    if (key.startsWith('global.borders')) {
      delete acc[key];
      key = key.replace('global', 'light');
      value = value.replace('{', '{light.');
      acc[key] = value;
      acc[key.replace('light', 'dark')] = value.replace('light', 'dark');
    }
    return acc;
  }, obj);
}

function renameKey(key) {
  let val = key
    .replace('global', '')
    .split('.')
    .map((i) => _.camelCase(i))
    .join('-');

  if (val.startsWith('-')) {
    val = val.slice(1);
  }
  const text = val.match(/^(body|headings|utilities)-/);
  if (text) {
    val = val.replace(text[1], `textStyles`);
  }
  const scale = val.match(/(\b(?!spacing\b|sizing\b)\w+\b)(-)(\d+)$/);
  if (scale) {
    val = val.replace(scale[0], `${scale[1]}${scale[3]}`);
  }
  if (val.includes('Xl')) {
    val = val.replace('Xl', 'xl');
  }
  val = val
    .replace('borderRadius', 'radii')
    .replace('fontFamilies', 'fonts')
    .replace('sizing', 'sizes')
    .replace('spacing', 'space')
    .replace('horizontalPadding', 'px')
    .replace('verticalPadding', 'py')
    .replace('fill', 'bg');

  const colorType = val.match(/(\w+)-(dark|light)(\d+)/);
  if (colorType) {
    const color = colorType[1];
    const theme = colorType[2];
    const num = colorType[3];
    val = val.replace(
      colorType[0],
      `${color}${theme === 'dark' ? _.capitalize(theme) : ''}${num}`
    );
  }
  val = `--f-${val}`;
  return val;
}

function finalParse(obj) {
  const entries = Object.entries(obj)
    // rename values of keys and values
    .map(([key, value]) => {
      key = renameKey(key);
      if (value.includes('{') && value.includes('}')) {
        const startIdx = value.indexOf('{');
        const endIdx = value.indexOf('}');
        const path = value.slice(startIdx + 1, endIdx);
        const newValue = `var(${renameKey(path)})`;
        value = value.replace(value.slice(startIdx, endIdx + 1), newValue);
      }
      return [key, value];
    })
    // transform hex colors to hsl
    .map(([key, value]) => {
      if (value.startsWith('#')) {
        value = chroma(value).css('hsla');
      }
      return [key, value];
    })
    // transform pixel ins rems
    .map(([key, value]) => {
      if (value.includes('px')) {
        const num = value.match(/(\d+)px/);
        const startIdx = value.indexOf(num[0]);
        const endIdx = startIdx + num[0].length;
        const newValue = `${num[1] / 16}rem`;
        value = value.replace(value.slice(startIdx, endIdx), newValue);
      }
      return [key, value];
    })

    // sort by key alphabetically
    .sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });

  return Object.fromEntries(entries);
}

function createCSSFile(obj) {
  const entries = Object.entries(obj).map(
    ([key, value]) => `${key}: ${value};`
  );
  const values = entries.map((v) => `\t${v}`).join('\n');
  return `:root {\n${values}\n}`;
}

function findOriginalValue(val, obj) {
  const path = val.replace('var(--f-', '').replace(')', '');
  const newVal = _.get(obj, `--f-${path}`);
  if (newVal?.startsWith('var(')) {
    return findOriginalValue(newVal, obj);
  }
  return newVal;
}

function createJSONFile(obj) {
  const res = {
    colors: {},
    space: {},
    fontSizes: {},
    fonts: {},
    fontWeights: {},
    lineHeights: {},
    letterSpacings: {},
    sizes: {},
    radii: {},
  };
  Object.entries(obj).forEach(([key, value]) => {
    key = key.replace('--f-', '');
    _.set(res, key.split('-'), value);
  });
  Object.entries(obj).forEach(([key, value]) => {
    if (value.startsWith('var(')) {
      const val = findOriginalValue(value, obj);
      key = key.replace('--f-', '');
      _.set(res, key.split('-'), val);
    }
  });
  return JSON.stringify(res, null, 2);
}

const BUILD_DIR = '../build';
const TOKENS_DIR = '../tokens';

async function main() {
  const global = readJSON(`${TOKENS_DIR}/global.json`);
  const light = readJSON(`${TOKENS_DIR}/colors-light.json`);
  const dark = readJSON(`${TOKENS_DIR}/colors-dark.json`);
  const radix = readJSON(`${TOKENS_DIR}/radix.json`);
  const withPaths = parsePath({
    global,
    light,
    dark,
    radix,
  });

  const CSSVariables = addCSSVariables(withPaths, {});
  const CSSparsed = adjustThemeOnVars(CSSVariables);
  const final = finalParse(CSSparsed);
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  const buildDir = path.join(__dirname, BUILD_DIR);
  const cssFilepath = path.join(buildDir, '/css-vars.css');
  const jsonFilepath = path.join(buildDir, '/tokens-raw.json');
  const cssFile = createCSSFile(final);
  const jsonFile = createJSONFile(final);

  if (fs.existsSync(buildDir)) {
    fs.rmSync(path.join(buildDir), { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.writeFileSync(cssFilepath, cssFile, 'utf-8');
  fs.writeFileSync(jsonFilepath, jsonFile, 'utf-8');
}

main();
