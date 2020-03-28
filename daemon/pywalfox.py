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

VERSION='1.1'
COLORS_PATH='~/.cache/wal/colors'

ACTIONS = {
    'VERSION': 'version',
    'COLORSCHEME': 'colors',
    'INVALID_MESSAGE': 'invalidMessage',
    'OUTPUT': 'output',
    'CUSTOM_CSS_APPLY': 'customCssApply',
    'CUSTOM_CSS_REMOVE': 'customCssRemove',
}

RECEIVED_ACTIONS = {
    'VERSION': 'version',
    'UPDATE': 'update',
    'ENABLE_CUSTOM_CSS': 'enableCustomCss',
    'DISABLE_CUSTOM_CSS': 'disableCustomCss'
}

# If the script is passed "update" as an argument, we want to tell the extension to update.
# This is useful if you want to automatically fetch new colors on a theme change
if len(sys.argv) == 2:
    if sys.argv[1] == 'update':
        client = uds.UDSClient()

        # Send a message to the UNIX-socket, telling it to send the new colorscheme to the addon
        client.sendMessage('update')
        sys.exit(1)

# Send the version of daemon to the addon
def sendVersion():
    sendMessage(encodeMessage({
        'action': ACTIONS['VERSION'],
        'data': VERSION
    }));

def sendColorscheme():
    response = fetchColors()
    sendMessage(encodeMessage({
        'action': ACTIONS['COLORSCHEME'],
        'success': response[0],
        'data': response[1]
    }));

def sendInvalidCommand():
    sendMessage(encodeMessage({
        'action': ACTIONS['INVALID_MESSAGE']
    }))

def sendOutput(message):
    sendMessage(encodeMessage({
        'action': ACTIONS['OUTPUT'],
        'data': message
    }))

def sendCustomCssResponse(action, target, response):
    sendMessage(encodeMessage({
        'action': action,
        'target': target,
        'success': response[0],
        'data': response[1]
    }))

def fetchColors():
    colors = []

    try:
        with open(os.path.expanduser(COLORS_PATH), 'r') as f:
            for line in f.readlines():
                colors.append(line.rstrip('\n'))
    except IOError:
        return (False, 'Could not read colors from: %s' % COLORS_PATH)

    colorscheme = [
        colors[0],
        colors[1],
        colors[2],
        colors[3],
        colors[4],
        colors[5],
        colors[6],
        colors[7],
        colors[8],
        colors[9],
        colors[10],
        colors[11],
        colors[12],
        colors[13],
        colors[14],
        colors[15],
        '#ffffff',
        colorutils.generateLighterShade(colors[0], 35)
    ]

    return (True, colorscheme)

def getChromePath():
    profilePath = glob.glob('%s/*.default-release' % os.path.expanduser('~/.mozilla/firefox'))
    if len(profilePath) == 1:
        chromePath = os.path.join(profilePath[0], 'chrome')
        if not os.path.exists(chromePath):
            os.makedirs(chromePath)
        return chromePath

    return False

def applyCustomCss(filename):
    try:
        shutil.copy('./assets/%s' % filename, '%s/%s' % (customCssPath, filename))
        return (True, 'Custom CSS: "%s" has been enabled' % filename)
    except Exception as e:
        return (False, 'Could not copy custom CSS to folder: %s' % str(e))

def removeCustomCss(filename):
    try:
        os.remove('%s/%s' % (customCssPath, filename))
        return (True, 'Custom CSS: "%s" has been disabled' % filename)
    except Exception as e:
        return (False, 'Could not remove custom CSS: %s' % str(e))

def setCustomCss(action, target):
    response = ()
    filename = '%s.css' % target

    if action == ACTIONS['CUSTOM_CSS_APPLY']:
        response = applyCustomCss(filename)
    else:
        response = removeCustomCss(filename)

    sendCustomCssResponse(action, target, response)

def handleReceivedMessage(message):
    try:
        action = message['action']
        if action == RECEIVED_ACTIONS['VERSION']:
            sendVersion()
        elif action == RECEIVED_ACTIONS['UPDATE']:
            sendColorscheme()
        elif action == RECEIVED_ACTIONS['ENABLE_CUSTOM_CSS']:
            setCustomCss(ACTIONS['CUSTOM_CSS_APPLY'], message['target']);
        elif action == RECEIVED_ACTIONS['DISABLE_CUSTOM_CSS']:
            setCustomCss(ACTIONS['CUSTOM_CSS_REMOVE'], message['target']);
        else:
            sendInvalidCommand()
    except:
        sendOutput('Daemon received a message with an invalid format. Do you need to update?')

# Handles messages from the UNIX socket, e.g when the user calls this script with the "update" argument
def handleSocketMessage(server):
    while True:
        update = server.shouldUpdate()
        if update:
            sendOutput('Update triggered from external script')
            sendColorscheme()

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

