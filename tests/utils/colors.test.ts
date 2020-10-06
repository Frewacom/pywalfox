import { validateHex, rgbToHex, changeLuminance } from '@utils/colors';

describe('validateHex', () => {
  test('validates a hex value', () => {
    expect(validateHex('#000000')).toBe('000000');
    expect(validateHex('FFFFFF')).toBe('FFFFFF');
    expect(validateHex('FE')).toBe('FFEE');
    expect(validateHex('#FE')).toBe('FFEE');
    expect(validateHex('')).toBe('');
    expect(validateHex('£€%ghijkl')).toBe('');
  });
});

describe('rgbToHex', () => {
  test('converts an rgb value to a hex value', () => {
    expect(rgbToHex('000000')).toBe('#NaN');
    expect(rgbToHex('#FFFFFF')).toBe('#FFFFFF');
    expect(rgbToHex('rgb(255,255,255,255)')).toBe('#ffffffff');
    expect(rgbToHex('rgb(0,0,0,0)')).toBe('#00000000');
  });
});

describe('changeLuminance', () => {
  test('changes the luminance of a color', () => {
    expect(changeLuminance('#FFFFFF', 0)).toBe('#ffffff');
    expect(changeLuminance('#FFFFFF', 255)).toBe('#ffffff');
    /* expect(changeLuminance('#000000', 0)).toBe('#0d0d0d'); */
    expect(changeLuminance('#000000', 255)).toBe('#ffffff');
  });
});
