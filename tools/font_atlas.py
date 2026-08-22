#!/usr/bin/env python3
# tools/font_atlas.py — atlante dei font armeni: come cambiano le lettere
#
# Produce un PDF che serve a leggere l'armeno "in giro", dove i font non sono
# quelli dell'app. Non è un catalogo tipografico: è ordinato per rischio di
# lettura, misurato rasterizzando i glifi e confrontandoli fra loro.
#
# Uso: python3 tools/font_atlas.py [output.pdf]

import json, itertools, sys, os
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from weasyprint import HTML

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
# I font stanno nel repo: lo strumento è riproducibile senza scaricare nulla.
FDIR = HERE / 'fonts'
_SYS = {'DejaVuSans.ttf': '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'}

# I primi cinque sono i caratteri realmente usati in Armenia (insegne, libri,
# documenti). Gli ultimi tre sono quelli che incontri su schermo fuori dall'Armenia.
FONTS = {
    'GHEA Grapalat': 'GHEAGrpalatReg.otf',
    'GHEA Grapalat corsivo': 'GHEAGrapalatRit.otf',
    'Arian AMU': 'arnamu.ttf',
    'Arian AMU corsivo': 'arnamu_italic.ttf',
    'Mk Parz': 'Mk_Parz_U.ttf',
    'Noto Sans Armenian': 'NotoSansArmenian-Regular.ttf',
    'Noto Serif Armenian': 'NotoSerifArmenian-Regular.ttf',
    'DejaVu Sans': 'DejaVuSans.ttf',
}
AUTENTICI = ['GHEA Grapalat', 'Arian AMU', 'Mk Parz']
KEY = {n: 'f%d' % i for i, n in enumerate(FONTS)}

LETTERS = [(chr(u), chr(u + 0x30)) for u in range(0x531, 0x557)]  # maiuscola, minuscola
LOWER = [l for _, l in LETTERS]

# ---------- misura della confondibilità ----------
S = 48
def _resolve(fn):
    p = FDIR / fn
    return p if p.exists() else Path(_SYS.get(str(fn), str(p)))

def bitmap(ch, path):
    f = ImageFont.truetype(str(_resolve(Path(path).name)), 40)
    img = Image.new('L', (S, S), 255)
    d = ImageDraw.Draw(img)
    bb = d.textbbox((0, 0), ch, font=f)
    w, h = bb[2] - bb[0], bb[3] - bb[1]
    if w <= 0 or h <= 0:
        return None
    d.text(((S - w) / 2 - bb[0], (S - h) / 2 - bb[1]), ch, font=f, fill=0)
    return ((255 - np.asarray(img, dtype=float)) > 100).astype(bool)

def iou(a, b):
    u = np.logical_or(a, b).sum()
    return float(np.logical_and(a, b).sum() / u) if u else 0.0

def confusable():
    per_pair = {}
    for name, fn in FONTS.items():
        B = {c: bitmap(c, FDIR / fn) for c in LOWER}
        B = {k: v for k, v in B.items() if v is not None}
        for a, b in itertools.combinations(sorted(B), 2):
            per_pair.setdefault((a, b), {})[name] = iou(B[a], B[b])
    rows = []
    for (a, b), d in per_pair.items():
        mx = max(d.values()); mn = min(d.values())
        rows.append({'a': a, 'b': b, 'max': mx, 'min': mn,
                     'peggiore': max(d, key=d.get), 'migliore': min(d, key=d.get)})
    return rows

# ---------- lettere armene che sembrano latine ----------
import string as _string
def lookalike(fn, soglia=0.85):
    """Per ogni lettera armena, la lettera latina più simile in quel font."""
    out = {}
    lat = {L: bitmap(L, FDIR / fn) for L in _string.ascii_letters}
    for u in range(0x561, 0x587):
        ch = chr(u)
        a = bitmap(ch, FDIR / fn)
        if a is None:
            continue
        best = (0.0, '')
        for L, b in lat.items():
            if b is None:
                continue
            s = iou(a, b)
            if s > best[0]:
                best = (s, L)
        if best[0] >= soglia:
            out[ch] = best
    return out

# ---------- vocabolario del corso ----------
def vocab():
    out = []
    for line in open(ROOT / 'vocab_full.txt', encoding='utf-8'):
        if '=' in line:
            hy, it = line.split('=', 1)
            out.append((hy.strip(), it.strip()))
    return out

# ---------- HTML ----------
def build_html():
    rows = confusable()
    rischio = sorted(rows, key=lambda r: -r['max'])[:14]
    dipende = sorted(rows, key=lambda r: -(r['max'] - r['min']))[:12]
    words = vocab()

    faces = '\n'.join(
        f"@font-face {{ font-family: '{k}'; src: url('file://{_resolve(fn)}'); }}"
        for (n, fn), k in zip(FONTS.items(), KEY.values()))

    css = f"""
    {faces}
    @page {{ size: A4; margin: 14mm 12mm; @bottom-center {{
        content: counter(page); font-family: sans-serif; font-size: 8pt; color: #999; }} }}
    body {{ font-family: 'Helvetica', sans-serif; font-size: 9.5pt; color: #222; }}
    h1 {{ font-size: 20pt; margin: 0 0 2mm; }}
    h2 {{ font-size: 13pt; margin: 7mm 0 2mm; border-bottom: 1px solid #ccc; padding-bottom: 1mm; }}
    p.lead {{ color: #555; margin: 0 0 4mm; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th {{ font-size: 7pt; color: #666; font-weight: normal; text-align: center;
          padding: 1mm 0; border-bottom: 1px solid #ddd; }}
    td {{ text-align: center; padding: 1.2mm 0; border-bottom: 1px solid #f0f0f0; }}
    td.lat {{ font-size: 8pt; color: #888; width: 12mm; text-align: left; }}
    .big {{ font-size: 17pt; line-height: 1.1; }}
    .warn {{ background: #fff8e6; border-left: 3px solid #e0b400; padding: 2mm 3mm; margin: 3mm 0; }}
    .pair td {{ padding: 2mm 0; }}
    .num {{ font-size: 7.5pt; color: #888; }}
    .wtab td {{ text-align: left; padding: 1.6mm 2mm; }}
    .wit {{ font-size: 8pt; color: #777; }}
    .page-break {{ page-break-before: always; }}
    """

    H = [f"<html><head><meta charset='utf-8'><style>{css}</style></head><body>"]
    H.append("<h1>Come cambia l'armeno secondo il font</h1>")
    H.append("<p class='lead'>Le stesse lettere, in otto caratteri diversi. Serve a leggere insegne, "
             "libri e schermi fuori dall'app, dove il font non è quello a cui sei abituato. "
             "L'ordine non è alfabetico ma per rischio: prima ciò che si confonde davvero.</p>")
    H.append("<div class='warn'>I primi cinque caratteri — GHEA Grapalat, Arian AMU, Mk Parz — "
             "sono quelli realmente usati in Armenia su insegne, libri e documenti. "
             "Gli ultimi tre sono quelli che incontri su schermo fuori dall'Armenia.<br><br>"
             "Nota: <b>FreeMono</b> è stato escluso perché disegna տ come una «s» latina e "
             "ք come una «f» — due forme che nessun font armeno autentico usa.</div>")

    # --- 0. false amiche latine
    laa = [lookalike(FONTS[n]) for n in AUTENTICI]
    comuni = sorted({c for c in laa[0] if any(c in x for x in laa[1:])},
                    key=lambda c: -laa[0][c][0])
    H.append("<h2>1. Lettere armene che sembrano latine</h2>")
    H.append("<p class='lead'>È la trappola più insidiosa per chi legge dall'italiano: "
             "queste lettere sono <b>identiche o quasi</b> a lettere latine, ma si leggono "
             "in tutt'altro modo. Misurato sui caratteri realmente usati in Armenia.</p>")
    H.append("<table><tr><th>armena</th><th>si legge</th><th>sembra</th>" +
             ''.join(f"<th>{n}</th>" for n in FONTS) + "</tr>")
    SUONO = {'հ': 'h', 'ո': 'vo- / -o-', 'ս': 's', 'օ': 'o', 'ց': "ts'", 'գ': 'g',
             'ի': 'i', 'տ': 't', 'ք': "k'", 'ր': 'r', 'բ': 'b', 'լ': 'l', 'ն': 'n'}
    for ch in comuni:
        lat_ch = laa[0][ch][1]
        cells = ''.join(f"<td class='big' style=\"font-family:'{k}'\">{ch}</td>" for k in KEY.values())
        H.append(f"<tr><td class='big' style=\"font-family:'{KEY['GHEA Grapalat']}'\">{ch}</td>"
                 f"<td class='num'>[{SUONO.get(ch,'?')}]</td>"
                 f"<td class='num'>latina «{lat_ch}»</td>{cells}</tr>")
    H.append("</table>")
    g = KEY['GHEA Grapalat']
    H.append(f"<div class='warn'>Due esempi dal corso. "
             f"<span style=\"font-family:'{g}';font-size:14pt\">ոչ</span> («no») sembra "
             f"cominciare per «n», ma si legge <i>voch'</i>: la ո a inizio parola vale <i>vo</i>. "
             f"<span style=\"font-family:'{g}';font-size:14pt\">օր</span> («giorno») sembra "
             f"«op», ma è <i>or</i>: quella che pare una «p» è una <i>r</i>.</div>")

    # --- 1. coppie confondibili
    H.append("<div class='page-break'></div><h2>2. Lettere che si confondono fra loro</h2>")
    H.append("<p class='lead'>Misurato sovrapponendo i glifi: 1,00 = identici. "
             "«Peggio in» è il font in cui la coppia è più difficile da distinguere.</p>")
    H.append("<table class='pair'><tr><th></th>" +
             ''.join(f"<th>{n}</th>" for n in FONTS) + "<th>peggio in</th></tr>")
    for r in rischio:
        cells = ''.join(
            f"<td class='big' style=\"font-family:'{k}'\">{r['a']}&nbsp;{r['b']}</td>"
            for k in KEY.values())
        H.append(f"<tr><td class='lat'>{r['max']:.2f}</td>{cells}"
                 f"<td class='num'>{r['peggiore']}</td></tr>")
    H.append("</table>")

    # --- 2. coppie che dipendono dal font
    H.append("<h2>3. Coppie che dipendono dal carattere</h2>")
    H.append("<p class='lead'>Distinguibili in un font, quasi identiche in un altro. "
             "Sono le più insidiose: l'occhio impara la forma sbagliata e poi non riconosce l'altra.</p>")
    H.append("<table class='pair'><tr><th></th>" +
             ''.join(f"<th>{n}</th>" for n in FONTS) + "<th>da → a</th></tr>")
    for r in dipende:
        cells = ''.join(
            f"<td class='big' style=\"font-family:'{k}'\">{r['a']}&nbsp;{r['b']}</td>"
            for k in KEY.values())
        H.append(f"<tr><td class='lat'>{r['a']}/{r['b']}</td>{cells}"
                 f"<td class='num'>{r['min']:.2f} → {r['max']:.2f}</td></tr>")
    H.append("</table>")

    # --- 3. alfabeto completo
    H.append("<div class='page-break'></div><h2>4. L'alfabeto completo</h2>")
    H.append("<table><tr><th></th>" + ''.join(f"<th>{n}</th>" for n in FONTS) + "</tr>")
    for up, lo in LETTERS:
        cells = ''.join(
            f"<td class='big' style=\"font-family:'{k}'\">{up}&nbsp;{lo}</td>" for k in KEY.values())
        H.append(f"<tr><td class='lat'>{lo}</td>{cells}</tr>")
    H.append("</table>")

    # --- 4. parole del corso
    H.append("<div class='page-break'></div><h2>5. Le parole del corso</h2>")
    H.append("<p class='lead'>Tutte le voci del vocabolario, in quattro caratteri scelti perché "
             "massimamente diversi fra loro: bastone, graziato, corsivo, monospaziato.</p>")
    quattro = ['GHEA Grapalat', 'Arian AMU corsivo', 'Mk Parz', 'Noto Sans Armenian']
    H.append("<table class='wtab'><tr>" +
             ''.join(f"<th style='text-align:left'>{n}</th>" for n in quattro) +
             "<th style='text-align:left'>italiano</th></tr>")
    for hy, it in words:
        cells = ''.join(
            f"<td style=\"font-family:'{KEY[n]}';font-size:13pt\">{hy}</td>" for n in quattro)
        H.append(f"<tr>{cells}<td class='wit'>{it}</td></tr>")
    H.append("</table>")

    H.append("</body></html>")
    return '\n'.join(H)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/outputs/AB1J_font_armeni.pdf'
    os.makedirs(os.path.dirname(out), exist_ok=True)
    HTML(string=build_html()).write_pdf(out)
    print('scritto:', out)
