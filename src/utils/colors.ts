function validateHex(hex: string) {
  let validatedHex = String(hex).replace(/[^0-9a-f]/gi, "");
  if (hex.length < 6) {
    validatedHex = validatedHex.replace(/(.)/g, '$1$1');
  }

  return validatedHex;
}

export function rgbToHex(rgb: string) {
  if (rgb[0] === '#' || !rgb) { return rgb; }
  const hex = rgb.substr(4, rgb.indexOf(')') - 4).split(',').map((color) => {
    let str = parseInt(color).toString(16);
    return str.length === 1 ? str = "0" + str : str;
  }).join('');
  return '#' + hex;
}

// https://www.sitepoint.com/javascript-generate-lighter-darker-color/
export function changeLuminance(hex: string, lum: number) {
  let validatedHex = validateHex(hex);
  if (validatedHex === '000000') {
    // If the color is completely black, we can not generate a brighter color,
    // so we change it to be a very dark gray.
    validatedHex = '0D0D0D';
  }

  lum = lum || 0;
  let rgb: any = "#"
  let c: any;

  for (let i = 0; i < 3; ++i) {
    c = parseInt(validatedHex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }

  return rgb;
}

export function normalizeLuminance(hex: string, lum: number, min: number, max: number) {
  let validatedHex = validateHex(hex);

  let rgb: any = "#"
  let c: any;

  for (let i = 0; i < 3; ++i) {
    c = parseInt(validatedHex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(min, c + (c * lum)), max)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }
  return rgb;
}

