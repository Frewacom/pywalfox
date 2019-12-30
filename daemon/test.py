import os

colors = []
with open(os.path.expanduser('~/.cache/wal/colors'), 'r') as f:
    for line in f.readlines():
        colors.append(line.rstrip('\n'))

print(colors)
