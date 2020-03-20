import os
import sys
import socket

HOST='/tmp/pywalfox_uds_socket'

class UDSServer:
    def __init__(self):
        if os.path.exists(HOST):
            os.remove(HOST)

        # Create a datagram UNIX socket (connection-less)
        self.s = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
        print('Created UNIX socket')

    def start(self):
        try:
            self.s.bind(HOST)
            print('Bound UNIX socket to %s' % HOST)
            return True
        except:
            print('Failed to bind socket')
            return False

    def shouldUpdate(self):
        data = self.s.recv(1024)
        if not data:
            return False
        else:
            if data.decode('utf-8') == 'update':
                return True
            else:
                return False

    def close(self):
        self.s.close()
        os.remove(HOST)

class UDSClient:
    def __init__(self):
        if os.path.exists(HOST):
            self.s = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
            self.s.connect(HOST)
        else:
            print('Could not find socket: %s' % HOST)
            sys.exit(1)

    def sendMessage(self, message):
        self.s.send(message.encode('utf-8'))

