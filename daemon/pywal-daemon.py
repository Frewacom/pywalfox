#!/usr/bin/env python

import os
import sys
import json
import struct

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
        'background': colors[0],
        'foreground': colors[-1],
        'accent_primary': colors[1],
        'accent_secondary': colors[2],
        'accent_primary_light': colors[4],
        'accent_secondary_light': colors[5]
    }

    return (True, colorscheme)

while True:
    receivedMessage = getMessage()
    if receivedMessage == 'update':
        (success, value) = fetchColors()
        sendMessage(createMessage(success, value))
