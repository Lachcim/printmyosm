import math

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

class Tile:
    def __init__(self, zoom, x, y):
        self.zoom = 2 ** zoom
        self.x = x
        self.y = y

    def get_latitude(self):
        return math.atan(math.sinh(math.pi * (1 - 2 * self.y / self.zoom))) * 180 / math.pi

    def get_longitude(self):
        return self.x / self.zoom * 360 - 180

    @staticmethod
    def for_coordinates(zoom, latitude, longitude):
        x = math.floor(2 ** zoom * ((longitude + 180) / 360))
        y = math.floor(2 ** (zoom - 1) * (1 - (math.log(math.tan(latitude / 180 * math.pi) + (1 / math.cos(latitude / 180 * math.pi))) / math.pi)))
        return Tile(zoom, x, y)

    def is_in_polygon(vertices):
        x = self.get_longitude()
        y = self.get_latitude()

        pass
