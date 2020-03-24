import os
import sys
import socket

HOST='/tmp/pywalfox_uds_socket'

class UDSServer:
    def __init__(self):
        if os.path.exists(HOST):
            os.remove(HOST)

        self.s = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)

    def start(self):
        try:
            self.s.bind(HOST)
            return True
        except:
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
            try:
                self.s = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
                self.s.connect(HOST)
            except:
                print('Failed to connect to socket')
                sys.exit(1)
        else:
            print('Could not find socket: %s' % HOST)
            sys.exit(1)

    def sendMessage(self, message):
        self.s.send(message.encode('utf-8'))

