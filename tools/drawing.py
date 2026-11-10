# Usage: python3 tools/drawing.py > drawing.svg, then paste the output between
# the "drawing:start" and "drawing:end" comments in index.html.
# Generates the TidBit dimensional drawing (inline SVG) for index.html.
# Scale: 4.5px per mm. All TidBit sizes match the mockup (340 x 508px at 5.219px/mm).
K = 4.5
W, H, R, T = 65.10, 97.30, 9.20, 6.40
BEZ, DW, DH = 2.30, 60.50, 92.70
RING_D, RING_IN, RING_Y = 52.00, 40.00, 27.34   # ring centre 27.34mm from top = MagSafe centre on iPhone 18 Pro
px = lambda mm: round(mm * K, 2)

out = []
a = out.append

def dim_h(x1, x2, y, label, ext_from, sub=None, below=False):
    a(f'<path class="dw-thin" d="M{x1} {ext_from}V{y + (8 if below else -8)}M{x2} {ext_from}V{y + (8 if below else -8)}"/>')
    a(f'<path class="dw-dim" d="M{x1} {y}H{x2}" marker-start="url(#dw-arrow)" marker-end="url(#dw-arrow)"/>')
    ty = y + 22 if below else y - 10
    a(f'<text class="dw-num" x="{(x1 + x2) / 2}" y="{ty}" text-anchor="middle">{label}</text>')
    if sub:
        a(f'<text class="dw-text" x="{(x1 + x2) / 2}" y="{ty + 17}" text-anchor="middle">{sub}</text>')

def dim_v(y1, y2, x, label, ext_from, left=True, sub=None):
    a(f'<path class="dw-thin" d="M{ext_from} {y1}H{x + (-8 if left else 8)}M{ext_from} {y2}H{x + (-8 if left else 8)}"/>')
    a(f'<path class="dw-dim" d="M{x} {y1}V{y2}" marker-start="url(#dw-arrow)" marker-end="url(#dw-arrow)"/>')
    cx, cy = (x - 10 if left else x + 10), (y1 + y2) / 2
    rot = -90 if left else 90
    a(f'<text class="dw-num" x="{cx}" y="{cy}" text-anchor="middle" transform="rotate({rot} {cx} {cy})">{label}</text>')
    if sub:
        sx = cx - 16 if left else cx + 16
        a(f'<text class="dw-text" x="{sx}" y="{cy}" text-anchor="middle" transform="rotate({rot} {sx} {cy})">{sub}</text>')

def balloon(x, y, n):
    a(f'<rect class="dw-line" x="{x - 9}" y="{y - 9}" width="18" height="18"/>')
    a(f'<text class="dw-num dw-num--small" x="{x}" y="{y + 4.5}" text-anchor="middle">{n}</text>')

def leader(x1, y1, x2, y2):
    a(f'<path class="dw-thin" d="M{x1} {y1}L{x2} {y2}"/><circle class="dw-ink" cx="{x1}" cy="{y1}" r="2"/>')

w, h, r = px(W), px(H), px(R)
a('<svg class="drawing__svg" viewBox="0 0 1200 830" role="img" aria-labelledby="dw-title dw-desc">')
a('<title id="dw-title">TidBit dimensional drawing</title>')
a('<desc id="dw-desc">Front, side and back views of TidBit. It measures 65.10 by 97.30 millimetres and 6.40 millimetres thick, with corner radius 9.20. '
  'The e-paper display area is 60.50 by 92.70. On the back, a 52.00 millimetre MagSafe magnet ring is centred 27.34 millimetres from the top edge, with an alignment tab below it. '
  'Notes: 1, e-paper panel reflects light and emits none. 2, cell runs for weeks on one charge. 3, MagSafe array seats below the camera plateau. 4, USB-C: charge it, then forget it. 5, no vibration, no chime, nothing to scroll.</desc>')
a('<defs>'
  '<marker id="dw-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path class="dw-ink" d="M0 1.5L10 5L0 8.5z"/></marker>'
  '<pattern id="dw-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="dw-thin" d="M0 0V7"/></pattern>'
  '<pattern id="dw-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path class="dw-grid" d="M30 0H0V30"/></pattern>'
  '</defs>')
a('<rect class="dw-sheet" x="12" y="12" width="1176" height="806" rx="18"/>')
a('<rect x="12" y="12" width="1176" height="806" rx="18" fill="url(#dw-grid)"/>')

# ---------- Front view ----------
fx, fy = 150, 120
a(f'<rect class="dw-line dw-body" x="{fx}" y="{fy}" width="{w}" height="{h}" rx="{r}"/>')
dx, dy, dw_, dh = fx + px(BEZ), fy + px(BEZ), px(DW), px(DH)
a(f'<rect class="dw-thin dw-screen" x="{dx}" y="{dy}" width="{dw_}" height="{dh}" rx="{px(R - BEZ)}"/>')
lx = dx + 18
a(f'<text class="dw-ui" x="{lx}" y="{dy + 26}">9:41</text><text class="dw-ui" x="{dx + dw_ - 18}" y="{dy + 26}" text-anchor="end">16 days</text>')
a(f'<text class="dw-ui-big" x="{lx}" y="{dy + 72}">10</text><text class="dw-ui dw-ui--bold" x="{lx + 40}" y="{dy + 70}">Tuesday</text>')
a(f'<path class="dw-thin" d="M{lx} {dy + 86}H{dx + dw_ - 18}"/>')
a(f'<rect class="dw-ink" x="{lx}" y="{dy + 98}" width="{dw_ - 36}" height="24" rx="5"/>')
a(f'<text class="dw-ui dw-ui--inv" x="{lx + 10}" y="{dy + 114.5}">Next: 09:00 Team Standup</text>')
for i, (t, e) in enumerate([("09:00", "Team Standup"), ("11:30", "Client Meeting"), ("14:30", "Project Review"), ("16:00", "Team Coffee")]):
    yy = dy + 150 + i * 24 + (10 if i > 1 else 0)
    a(f'<path class="dw-line" d="M{lx} {yy - 11}V{yy + 3}"/><text class="dw-ui dw-ui--bold" x="{lx + 10}" y="{yy}">{t}</text><text class="dw-ui" x="{lx + 52}" y="{yy}">{e}</text>')
a(f'<path class="dw-thin" d="M{lx} {dy + 262}H{dx + dw_ - 18}"/>')
a(f'<text class="dw-ui-big" x="{lx}" y="{dy + 306}">64°</text><text class="dw-ui" x="{lx + 58}" y="{dy + 290}">NEW YORK</text><text class="dw-ui dw-ui--bold" x="{lx + 58}" y="{dy + 306}">Cool and breezy</text>')
tabw = (dw_ - 36 - 3 * 9) / 4
for i in range(4):
    cls = "dw-ink" if i == 0 else "dw-thin"
    a(f'<rect class="{cls}" x="{lx + i * (tabw + 9):.2f}" y="{dy + dh - 40}" width="{tabw:.2f}" height="22" rx="11"/>')

dim_h(fx, fx + w, 84, f"{W:.2f}", fy - 6)
dim_v(fy, fy + h, 110, f"{H:.2f}", fx - 6)
dim_h(dx, dx + dw_, fy + h + 34, f"{DW:.2f}", fy + h + 6, sub="DISPLAY ACTIVE AREA", below=True)
dim_v(dy, dy + dh, fx + w + 34, f"{DH:.2f}", fx + w + 6, left=False)
# corner radius callout (bottom-left)
ccx, ccy = fx + r, fy + h - r
import math
p1 = (round(ccx - r * math.cos(math.pi / 4), 1), round(ccy + r * math.sin(math.pi / 4), 1))
leader(p1[0], p1[1], 112, fy + h + 40)
a(f'<text class="dw-num" x="30" y="{fy + h + 56}">R{R:.2f}</text><text class="dw-text" x="30" y="{fy + h + 72}">ALL CORNERS</text>')
a(f'<text class="dw-view" x="{fx + w / 2}" y="{fy + h + 114}" text-anchor="middle">Front</text>')

# ---------- Side view (section) ----------
sx, t = 610, px(T)
lay = [1.4, 3.2, 1.8]  # e-paper + cover, cell, magnet layer (mm)
x1, x2 = sx + px(lay[0]), sx + px(lay[0] + lay[1])
a(f'<rect class="dw-line dw-body" x="{sx}" y="{fy}" width="{t}" height="{h}" rx="8"/>')
a(f'<rect class="dw-hatch" x="{x1}" y="{fy + 10}" width="{x2 - x1}" height="{h - 20}"/>')
a(f'<path class="dw-thin" d="M{x1} {fy + 3}V{fy + h - 3}M{x2} {fy + 3}V{fy + h - 3}"/>')
ry1 = fy + px(RING_Y - RING_D / 2)
band = px((RING_D - RING_IN) / 2)
for yy in (ry1, fy + px(RING_Y + RING_IN / 2)):
    a(f'<rect class="dw-ink" x="{x2 + 1}" y="{yy}" width="{sx + t - x2 - 2.5}" height="{band}"/>')
a(f'<rect class="dw-hidden" x="{x1 + 1}" y="{fy + h - 16}" width="{x2 - x1 - 2}" height="12" rx="3"/>')
dim_h(sx, sx + t, fy + h + 34, f"{T:.2f}", fy + h + 6, below=True)
for n, (lxp, lyp, by) in enumerate([(sx + 3, fy + 190, 190), (x1 + 7, fy + 250, 250), (sx + t - 3, ry1 + 12, ry1 + 12 - fy), (x1 + 7, fy + h - 10, h - 40)], 1):
    leader(lxp, lyp, 688, fy + by)
    balloon(697, fy + by, n)
a(f'<text class="dw-view" x="{sx + t / 2}" y="{fy + h + 114}" text-anchor="middle">Side, section</text>')

# ---------- Back view ----------
bx = 790
a(f'<rect class="dw-line dw-body" x="{bx}" y="{fy}" width="{w}" height="{h}" rx="{r}"/>')
cx, cy = bx + w / 2, fy + px(RING_Y)
ro, ri = px(RING_D / 2), px(RING_IN / 2)
a(f'<path class="dw-hatch dw-line" fill-rule="evenodd" d="M{cx - ro} {cy}a{ro} {ro} 0 1 0 {2 * ro} 0a{ro} {ro} 0 1 0 {-2 * ro} 0zM{cx - ri} {cy}a{ri} {ri} 0 1 0 {2 * ri} 0a{ri} {ri} 0 1 0 {-2 * ri} 0z"/>')
a(f'<rect class="dw-hatch dw-line" x="{cx - 4}" y="{cy + ro + 8}" width="8" height="36"/>')
a(f'<path class="dw-center" d="M{cx - ro - 12} {cy}H{cx + ro + 12}M{cx} {cy - ro - 6}V{cy + ro + 56}"/>')
a(f'<g transform="translate({cx - 13} {fy + h - 82}) scale(0.82)"><rect class="dw-line" x="8.25" y="2.25" width="15.5" height="27.5" rx="5"/><rect class="dw-ink" x="11.5" y="13.5" width="9" height="12.5" rx="2"/></g>')
pt = (round(cx + ro * math.cos(math.pi / 4), 1), round(cy - ro * math.sin(math.pi / 4), 1))
leader(pt[0], pt[1], 1112, 96)
a(f'<text class="dw-num" x="1112" y="88" text-anchor="middle">Ø{RING_D:.2f}</text><text class="dw-text" x="1112" y="72" text-anchor="middle">MAGSAFE ARRAY</text>')
a(f'<path class="dw-thin" d="M{cx + ro + 14} {cy}H{bx + w + 52}"/>')
dim_v(fy, cy, bx + w + 44, f"{RING_Y:.2f}", bx + w - 30, left=False)
a(f'<text class="dw-view" x="{cx}" y="{fy + h + 114}" text-anchor="middle">Back</text>')

# ---------- Notes ----------
a('<path class="dw-thin" d="M12 684H1188"/>')
ny = 724
a(f'<text class="dw-text dw-text--bold" x="40" y="{ny}">NOTES</text>')
notes = ["E-PAPER PANEL. REFLECTS LIGHT, EMITS NONE.",
         "CELL. RUNS FOR WEEKS ON ONE CHARGE.",
         "MAGSAFE ARRAY. SEATS BELOW THE CAMERA PLATEAU.",
         "USB-C. CHARGE IT, THEN FORGET IT.",
         "NO VIBRATION. NO CHIME. NOTHING TO SCROLL."]
for i, n in enumerate(notes):
    col, row = divmod(i, 3)
    x, y = 40 + col * 380, ny + 26 + row * 24
    balloon(x + 9, y - 4.5, i + 1)
    a(f'<text class="dw-text" x="{x + 28}" y="{y}">{n}</text>')

# ---------- Title block ----------
tx, ty, tw, th = 790, 700, 382, 104
a(f'<rect class="dw-line dw-sheet" x="{tx}" y="{ty}" width="{tw}" height="{th}"/>')
a(f'<path class="dw-thin" d="M{tx + 222} {ty}V{ty + th}M{tx + 222} {ty + th / 3:.1f}H{tx + tw}M{tx + 222} {ty + 2 * th / 3:.1f}H{tx + tw}"/>')
a(f'<g transform="translate({tx + 16} {ty + 18}) scale(0.9)"><rect class="dw-line" x="8.25" y="2.25" width="15.5" height="27.5" rx="5"/><rect class="dw-ink" x="11.5" y="13.5" width="9" height="12.5" rx="2"/></g>')
a(f'<text class="dw-brand" x="{tx + 50}" y="{ty + 44}">TidBit</text>')
a(f'<text class="dw-text" x="{tx + 18}" y="{ty + 70}">E-PAPER MAGSAFE DISPLAY</text>')
a(f'<text class="dw-text dw-text--muted" x="{tx + 18}" y="{ty + 88}">CONCEPT. DO NOT SCALE.</text>')
for i, (k, v) in enumerate([("UNITS", "MM"), ("FITS", "iPHONE 18 PRO"), ("SHEET", "1 OF 1 · REV A")]):
    yy = ty + i * th / 3
    a(f'<text class="dw-text dw-text--muted" x="{tx + 234}" y="{yy + 21:.1f}">{k}</text>')
    a(f'<text class="dw-text dw-text--bold" x="{tx + tw - 12}" y="{yy + 21:.1f}" text-anchor="end">{v}</text>')
a('</svg>')
print("\n".join(out))
