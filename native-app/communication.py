import os
import sys
import socket

HOST=''
PORT=56652

class UDPServer:
    def __init__(self):
        self.s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    def start(self):
        try:
            self.s.bind((HOST, PORT))
            return True
        except:
            print('Failed to bind socket')
            return False

    def close(self):
        self.s.close()

class UDPClient:
    def __init__(self):
        self.s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    def sendMessage(self, message):
        self.s.sendto(message.encode('utf-8'), (HOST, PORT))

