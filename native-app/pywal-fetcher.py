#!/usr/bin/env python

import os
import sys
import json
import struct
import math
import glob
import shutil

try:
    # Python 3.x version
    # Read a message from stdin and decode it.
    def getMessage():
        rawLength = sys.stdin.buffer.read(4)
        if len(rawLength) == 0:
            sys.exit(0)
        messageLength = struct.unpack('@I', rawLength)[0]
        message = sys.stdin.buffer.read(messageLength).decode('utf-8')
        return json.loads(message)

    # Encode a message for transmission,
    # given its content.
    def encodeMessage(messageContent):
        encodedContent = json.dumps(messageContent).encode('utf-8')
        encodedLength = struct.pack('@I', len(encodedContent))
        return {'length': encodedLength, 'content': encodedContent}

    # Send an encoded message to stdout
    def sendMessage(encodedMessage):
        sys.stdout.buffer.write(encodedMessage['length'])
        sys.stdout.buffer.write(encodedMessage['content'])
        sys.stdout.buffer.flush()
except AttributeError:
    # Python 2.x version (if sys.stdin.buffer is not defined)
    # Read a message from stdin and decode it.
    def getMessage():
        rawLength = sys.stdin.read(4)
        if len(rawLength) == 0:
            sys.exit(0)
        messageLength = struct.unpack('@I', rawLength)[0]
        message = sys.stdin.read(messageLength)
        return json.loads(message)

    # Encode a message for transmission,
   # given its content.
    def encodeMessage(messageContent):
        encodedContent = json.dumps(messageContent)
        encodedLength = struct.pack('@I', len(encodedContent))
        return {'length': encodedLength, 'content': encodedContent}

    # Send an encoded message to stdout
    def sendMessage(encodedMessage):
        sys.stdout.write(encodedMessage['length'])
        sys.stdout.write(encodedMessage['content'])
        sys.stdout.flush()

def createMessage(key, response):
    if response[0]:
        return encodeMessage({
            'key': key,
            'success': True,
            'data': response[1]
        })

    return encodeMessage({
        'key': key,
        'success': False,
        'error': response[1]
    })

def fetchColors():
    colors = []
    colors_path = '~/.cache/wal/colors'

    try:
        with open(os.path.expanduser(colors_path), 'r') as f:
            for line in f.readlines():
                colors.append(line.rstrip('\n'))
    except IOError:
        return (False, 'Could not read colors from: %s' % colors_path)

    colorscheme = {
        'background': generateDarkerShade(colors[2], 150),
        'backgroundDark': colors[0],
        'backgroundLight': generateDarkerShade(colors[2], 110),
        'foreground': colors[-1],
        'accentPrimary': colors[1],
        'accentSecondary': colors[2],
        'accentPrimaryLight': colors[4],
        'accentSecondaryLight': colors[5],
        'text': '#ffffff',
        'color0': colors[0],
        'color1': colors[1],
        'color2': colors[2],
        'color3': colors[3],
        'color4': colors[4],
        'color5': colors[5],
        'color6': colors[6],
        'color7': colors[7],
        'color8': colors[8],
        'color9': colors[9],
        'color10': colors[10],
        'color11': colors[11],
        'color12': colors[12],
        'color13': colors[13],
        'color14': colors[14],
        'color15': colors[15]
    }

    return (True, colorscheme)

def limit(x):
    if x > 255:
        return 255
    elif x < 0:
        return 0

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

def getChromePath():
    path = glob.glob('%s/*.default-release/chrome' % os.path.expanduser('~/.mozilla/firefox'))
    if len(path) == 1:
        return path[0]

    return False

def enableCustomCss(path, filename):
    try:
        shutil.copy('./assets/%s' % filename, '%s/%s' % (path, filename))
        return (True, 'Custom CSS: "%s" has been enabled.' % filename)
    except Exception as e:
        return (False, 'Could not copy custom CSS to folder: %s' % str(e))

def disableCustomCss(path, filename):
    try:
        os.remove('%s/%s' % (path, filename))
        return (True, 'Custom CSS: "%s" has been disabled.' % filename)
    except Exception as e:
        return (False, 'Could not remove custom CSS: %s' % str(e))

customCssPath = getChromePath()
if not customCssPath:
    sendMessage(createMessage('enableCustomCss', False, 'Could not find the folder to put custom CSS in.'))

while True:
    receivedMessage = getMessage()
    if receivedMessage == 'update':
        sendMessage(createMessage('colors', fetchColors()))
    elif receivedMessage == 'enableCustomCss':
        (successChrome, dataChrome) = enableCustomCss(customCssPath, 'userChrome.css');
        (successContent, dataContent) = enableCustomCss(customCssPath, 'userContent.css');
        if successContent and successChrome:
            sendMessage(createMessage('enableCustomCss', (True, 'userChrome.css and userContent.css has been enabled.')))
        else:
            sendMessage(createMessage('enableCustomCss', (successChrome, dataChrome)))
            sendMessage(createMessage('enableCustomCss', (successContent, dataContent)))
    elif receivedMessage == 'disableCustomCss':
        (successChrome, dataChrome) = disableCustomCss(customCssPath, 'userChrome.css');
        (successContent, dataContent) = disableCustomCss(customCssPath, 'userContent.css');
        if successContent and successChrome:
            sendMessage(createMessage('disableCustomCss', (False, 'Custom CSS has been disabled.')))
        else:
            sendMessage(createMessage('disableCustomCss', (successChrome, dataChrome)))
            sendMessage(createMessage('disableCustomCss', (successContent, dataContent)))
    elif receivedMessage == 'enableNoScrollbar':
        sendMessage(createMessage('enableNoScrollbar', enableCustomCss(customCssPath, 'hide-scrollbar.as.css')))
    elif receivedMessage == 'disableNoScrollbar':
        sendMessage(createMessage('disableNoScrollbar', disableCustomCss(customCssPath, 'hide-scrollbar.as.css')))
