#!/usr/bin/env python

import os
import sys
import json
import struct
import math
import glob
import shutil
from threading import Thread

import uds
import colorutils

COLORS_PATH='~/.cache/wal/colors'

# If the script is passed "update" as an argument, we want to tell the extension to update.
# This is useful if you want to automatically fetch new colors on a theme change
if len(sys.argv) == 2:
    if sys.argv[1] == 'update':
        client = uds.UDSClient()
        client.sendMessage('update')
        sys.exit(1)

def sendOutput(message):
    sendMessage(encodeMessage({
        'key': 'output',
        'data': message
    }))

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

    try:
        with open(os.path.expanduser(COLORS_PATH), 'r') as f:
            for line in f.readlines():
                colors.append(line.rstrip('\n'))
    except IOError:
        return (False, 'Could not read colors from: %s' % COLORS_PATH)

    colorscheme = {
        'background': colors[0],
        'backgroundLight': colorutils.generateLighterShade(colors[0], 35),
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

def getChromePath():
    profilePath = glob.glob('%s/*.default-release' % os.path.expanduser('~/.mozilla/firefox'))
    if len(profilePath) == 1:
        chromePath = os.path.join(profilePath[0], 'chrome')
        if not os.path.exists(chromePath):
            os.makedirs(chromePath)
        return chromePath

    return False

def enableCustomCss(path, filename):
    try:
        shutil.copy('./assets/%s' % filename, '%s/%s' % (path, filename))
        return (True, 'Custom CSS: "%s" has been enabled' % filename)
    except Exception as e:
        return (False, 'Could not copy custom CSS to folder: %s' % str(e))

def disableCustomCss(path, filename):
    try:
        os.remove('%s/%s' % (path, filename))
        return (True, 'Custom CSS: "%s" has been disabled' % filename)
    except Exception as e:
        return (False, 'Could not remove custom CSS: %s' % str(e))

def handleReceivedMessage(message):
    if message == 'update':
        sendMessage(createMessage('colors', fetchColors()))
    elif message == 'enableCustomCss':
        (successChrome, dataChrome) = enableCustomCss(customCssPath, 'userChrome.css');
        (successContent, dataContent) = enableCustomCss(customCssPath, 'userContent.css');
        if successContent and successChrome:
            sendMessage(createMessage('enableCustomCss', (True, 'Custom CSS: "userChrome.css" and "userContent.css" has been enabled')))
        else:
            sendMessage(createMessage('enableCustomCss', (successChrome, dataChrome)))
            sendMessage(createMessage('enableCustomCss', (successContent, dataContent)))
    elif message == 'disableCustomCss':
        (successChrome, dataChrome) = disableCustomCss(customCssPath, 'userChrome.css');
        (successContent, dataContent) = disableCustomCss(customCssPath, 'userContent.css');
        if successContent and successChrome:
            sendMessage(createMessage('disableCustomCss', (False, 'Custom CSS: "userChrome.css" and "userContent.css" has been disabled')))
        else:
            sendMessage(createMessage('disableCustomCss', (successChrome, dataChrome)))
            sendMessage(createMessage('disableCustomCss', (successContent, dataContent)))
    elif message == 'enableNoScrollbar':
        sendMessage(createMessage('enableNoScrollbar', enableCustomCss(customCssPath, 'hide-scrollbar.as.css')))
    elif message == 'disableNoScrollbar':
        sendMessage(createMessage('disableNoScrollbar', disableCustomCss(customCssPath, 'hide-scrollbar.as.css')))

def handleSocketMessage(server):
    while True:
        update = server.shouldUpdate()
        if update:
            sendOutput('Update triggered from external script')
            sendMessage(createMessage('colors', fetchColors()))

# Get the path for custom CSS (the chrome folder)
customCssPath = getChromePath()

# Listen for messages via UNIX-sockets
server = uds.UDSServer()
success = server.start()
if success:
    t = Thread(target=handleSocketMessage, args=(server,))
    t.start()

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

    # Encode a message for transmission, given its content.
    def encodeMessage(messageContent):
        encodedContent = json.dumps(messageContent).encode('utf-8')
        encodedLength = struct.pack('@I', len(encodedContent))
        return {'length': encodedLength, 'content': encodedContent}

    # Send an encoded message to stdout
    def sendMessage(encodedMessage):
        sys.stdout.buffer.write(encodedMessage['length'])
        sys.stdout.buffer.write(encodedMessage['content'])
        sys.stdout.buffer.flush()

    while True:
        message = getMessage()
        handleReceivedMessage(message)
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

    # Encode a message for transmission, given its content.
    def encodeMessage(messageContent):
        encodedContent = json.dumps(messageContent)
        encodedLength = struct.pack('@I', len(encodedContent))
        return {'length': encodedLength, 'content': encodedContent}

    # Send an encoded message to stdout
    def sendMessage(encodedMessage):
        sys.stdout.write(encodedMessage['length'])
        sys.stdout.write(encodedMessage['content'])
        sys.stdout.flush()

    while True:
        message = getMessage()
        handleReceivedMessage(message)

# Cleanup
server.close()
t.exit()

