import json
from pprint import pprint
from copy import deepcopy
from random import uniform
import sys

wall = {"x": 540, "m": 9999999999999, "y": 0, "s": 15, "vx": 0, "ay": 0, "vy": 0, "ax": 0, "c": "#ffffff"}

all_parts = []

for i in range(0, 800, 30):
  wall["y"] = i
  if i % 120 != 0:
    all_parts.append(deepcopy(wall))

left_particles = [{"x": int(uniform(0, 1080 / 2 - 100)), "y": int(uniform(0, 720)), "c": "#ff0000", "dc": False, "ax": 0, "ay": 0, "s": 10, "m": 10} for _ in range(int(sys.argv[1])*2)]

right_particles = [{"x": int(uniform(1080 / 2 + 100, 1080)), "y": int(uniform(0, 720)), "c": "#0000ff", "dc": False, "ax": 0, "ay": 0, "s": 60, "m": 60} for _ in range(int(sys.argv[1])/2)]

open('membrane.json', 'w').write(json.dumps(all_parts + left_particles + right_particles))
