import colors from './colors';
import spacing from './spacing';
import typography from './typography';
import shadows from './shadows';
import radius from './radius';
import zIndex from './zIndex';

export {
  colors,
  spacing,
  typography,
  shadows,
  radius,
  zIndex,
};

export const theme = {
  colors,
  spacing,
  typography,
  shadows,
  radius,
  zIndex,
} as const;

export default theme;
