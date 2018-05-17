import json
import sys
from random import uniform

left_particles = [{"x": int(uniform(0, 1080 / 2 - 100)), "y": int(uniform(0, 720)), "c": "#ff0000", "dc": False, "ax": 0, "ay": 0} for _ in range(int(sys.argv[1]))]
right_particles = [{"x": int(uniform(1080 / 2 + 100, 1080)), "y": int(uniform(0, 720)), "c": "#0000ff", "dc": False, "ax": 0, "ay": 0} for _ in range(int(sys.argv[1]))]

print(json.dumps(left_particles + right_particles))
