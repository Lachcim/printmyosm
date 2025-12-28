from collections import deque
import math
import requests
import time
import os

vertices = [
    (50.8213, 21.8350),
    (50.6312, 22.8296),
    (50.6782, 23.0727),
    (50.6416, 23.1537),
    (50.5003, 23.0411),
    (50.4072, 23.3432),
    (50.3896, 23.4475),
    (50.1817, 23.3744),
    (50.3108, 23.0624),
    (50.4072, 22.9092),
    (50.4610, 22.7657),
    (50.5045, 22.7681),
    (50.5213, 22.6456),
    (50.5784, 22.5611),
    (50.6159, 22.2171),
    (50.6007, 22.1515),
    (50.6999, 21.8841),
]

def pairwise(iterable):
    iterator = iter(iterable)
    a = next(iterator, None)
    first = a

    for b in iterator:
        if a[1] <= b[1]:
            yield a, b
        else:
            yield b, a
        a = b

    if a[1] <= first[1]:
        yield a, first
    else:
        yield first, a

def point_inside_polygon(y, x):
    inside = False
    for (ay, ax), (by, bx) in pairwise(vertices):
        if ay > y and by > y:
            continue
        if ay < y and by < y:
            continue

        if ax > x:
            continue

        if ax < x and bx < x:
            inside = not inside
            continue

        slope = (by - ay) / (bx - ax)
        base = ay - slope * ax
        cutoff_point = (y - base) / slope

        if x > cutoff_point:
            inside = not inside

    return inside

class Tile:
    def __init__(self, zoom, x, y):
        self.zoom = zoom
        self.x = x
        self.y = y

    def get_xy(self):
        return self.x, self.y

    def get_latitude(self, plus_one=False):
        return math.atan(math.sinh(math.pi * (1 - 2 * (self.y + plus_one) / (2 ** self.zoom)))) * 180 / math.pi

    def get_longitude(self, plus_one=False):
        return (self.x + plus_one) / (2 ** self.zoom) * 360 - 180

    def get_neighbors(self):
        return [
            Tile(self.zoom, self.x + 1, self.y),
            Tile(self.zoom, self.x - 1, self.y),
            Tile(self.zoom, self.x, self.y + 1),
            Tile(self.zoom, self.x, self.y - 1)
        ]

    @staticmethod
    def for_coordinates(zoom, latitude, longitude):
        x = math.floor(2 ** zoom * ((longitude + 180) / 360))
        y = math.floor(2 ** (zoom - 1) * (1 - (math.log(math.tan(latitude / 180 * math.pi) + (1 / math.cos(latitude / 180 * math.pi))) / math.pi)))
        return Tile(zoom, x, y)

    def is_in_polygon(self):
        x1 = self.get_longitude()
        x2 = self.get_longitude(plus_one=True)
        y1 = self.get_latitude()
        y2 = self.get_latitude(plus_one=True)

        for x in (x1, x2):
            for y in (y1, y2):
                if point_inside_polygon(y, x):
                    return True

        return False

    def download(self):
        url = f"https://tile.tracestrack.com/topo__/{self.zoom}/{self.x}/{self.y}.webp?key=383118983d4a867dd2d367451720d724"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
            "Referer": "https://www.openstreetmap.org/"
        }

        response = requests.get(url, headers=headers, stream=True)
        assert response.status_code == 200

        os.makedirs("tiles", exist_ok=True)
        with open(self.get_filename(), "wb") as file:
            file.write(response.content)

    def get_filename(self):
        return f"tiles/{self.zoom}-{self.x}-{self.y}.webp"

first_tile = Tile.for_coordinates(14, *vertices[0])
queue = deque([first_tile])
visited = set()
tiles = []

while queue:
    tile = queue.popleft()
    if tile.get_xy() in visited:
        continue

    visited.add(tile.get_xy())

    if not tile.is_in_polygon():
        continue

    tiles.append(tile)
    for neighbor in tile.get_neighbors():
        queue.append(neighbor)

downloaded_count = 0
for tile in tiles:
    print(f"Getting {tile.get_xy()}... ", end="", flush=True)

    if os.path.isfile(tile.get_filename()):
        downloaded_count += 1
        print(f"Already downloaded {downloaded_count / len(tiles) * 100}%")
        continue

    tile.download()

    downloaded_count += 1
    print(f"Downloaded {downloaded_count / len(tiles) * 100}%")

    time.sleep(1)
