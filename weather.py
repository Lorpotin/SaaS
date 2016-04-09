#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
from PIL import ImageFont
from PIL import Image
from PIL import ImageDraw
import urllib2
import json

j = urllib2.urlopen("http://192.168.1.220:8000/weather").read()
j = json.loads(j)
print j
a = str(j['temperature'])
b = j['wawa']

text = (("Weather: ", (0, 0, 128)), (a + " ", (255, 215, 0)), (b, (255, 0, 255)))

font = ImageFont.truetype("/usr/share/fonts/truetype/freefont/FreeSans.ttf", 16)
all_text = ""
for text_color_pair in text:
    t = text_color_pair[0]
    all_text = all_text + t

print(all_text)
width, ignore = font.getsize(all_text)
print(width)

im = Image.new("RGB", (width + 30, 16), "black")
draw = ImageDraw.Draw(im)

x = 0;
for text_color_pair in text:
    t = text_color_pair[0]
    c = text_color_pair[1]
    print("t=" + t + " " + str(c) + " " + str(x))
    draw.text((x, 0), t, c, font=font)
    x = x + font.getsize(t)[0]

im.save("test.ppm")

os.system("sudo ./led-matrix -D 1 -r 16 -c 3 -t 60 -b 50 -R 180 test.ppm")
