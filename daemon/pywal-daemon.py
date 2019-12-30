#!/usr/bin/env python

import os
import sys
import json
import struct
import math

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

def createMessage(success, data):
    if success:
        return encodeMessage({
            'success': True,
            'data': data
        })

    return encodeMessage({
        'success': False,
        'error': data
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
        'background_dark': colors[0],
        'background': generateLighterShade(colors[0], 15),
        'foreground': colors[-1],
        'accent_primary': colors[1],
        'accent_secondary': colors[2],
        'accent_primary_light': colors[4],
        'accent_secondary_light': colors[5],
        'background_light': generateLighterShade(colors[0], 40)
    }

    return (True, colorscheme)

def limit(x):
    if x > 255:
        return 255

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

while True:
    receivedMessage = getMessage()
    if receivedMessage == 'update':
        (success, value) = fetchColors()
        sendMessage(createMessage(success, value))
