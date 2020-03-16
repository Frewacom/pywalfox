# Implements functions for modifing hex-colors in hex-format
import math

def limit(x):
    if x > 255:
        return 255
    elif x < 20:
        return 20

    return x

def rgb_to_hsv(rgb):
    r = float(rgb[0])
    g = float(rgb[1])
    b = float(rgb[2])
    high = max(r, g, b)
    low = min(r, g, b)
    h, s, v = high, high, high

    d = high - low
    s = 0 if high == 0 else d/high

    if high == low:
        h = 0.0
    else:
        h = {
            r: (g - b) / d + (6 if g < b else 0),
            g: (b - r) / d + 2,
            b: (r - g) / d + 4,
        }[high]
        h /= 6

    return h, s, v

def hsv_to_rgb(hsv):
    h = hsv[0]
    s = hsv[1]
    v = hsv[2]

    i = math.floor(h*6)
    f = h*6 - i
    p = v * (1-s)
    q = v * (1-f*s)
    t = v * (1-(1-f)*s)

    r, g, b = [
        (v, t, p),
        (q, v, p),
        (p, v, t),
        (p, q, v),
        (t, p, v),
        (v, p, q),
    ][int(i%6)]

    return (r, g, b)

def hex_to_rgb(h):
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(rgb):
    r = int(rgb[0])
    g = int(rgb[1])
    b = int(rgb[2])

    return '#%02x%02x%02x' % (r, g, b)

def generateLighterShade(hexcolor, modifier):
    h = hexcolor.lstrip('#')
    values = hex_to_rgb(h)

    hsv = rgb_to_hsv(values)
    rgb = hsv_to_rgb((hsv[0], hsv[1], limit(hsv[2] + modifier)))
    return rgb_to_hex(rgb)

def generateDarkerShade(hexcolor, modifier):
    h = hexcolor.lstrip('#')
    values = hex_to_rgb(h)

    hsv = rgb_to_hsv(values)
    rgb = hsv_to_rgb((hsv[0], hsv[1], limit(hsv[2] - modifier)))
    return rgb_to_hex(rgb)
