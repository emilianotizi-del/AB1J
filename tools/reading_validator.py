# tools/reading_validator.py — crea e valida una lettura contro la sequenza del corso
import json, re, sys, os
sys.path.insert(0, __import__('os').path.dirname(__file__))
from vocab_at import forms

R = __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..')+'/'
SUFF = r'(ը|ն|ս|դ|ի|ից|ով|ում|ին|ներ|ները|ներին|երը|եր)$'

def stems(fs):
    out = set(fs)
    for w in fs:
        out.add(re.sub(SUFF, '', w))
    return out

def validate(after, text, extra):
    """extra = forme lecite in più (parole nuove e loro flessioni)"""
    known = {w.lower() for w in forms(after)}
    kstem = stems(known)
    ex = {e.lower() for e in extra}
    PROPER = {'Հայաստան','Հայաստանը','Հայաստանի','Հայաստանից','Հայաստանում','Իտալիա','Իտալիան',
              'Իտալիայից','Իտալիայում','Երևան','Երևանը','Երևանում','Անի','Անին','Անիից','Արամ','Արամը',
              'Անուշ','Անուշը','Դավիթ','Դավիթը','Աննա','Աննան','Սարո','Սարոն','Նարե','Նարեն'}
    ex |= PROPER
    bad = []
    for t0 in re.findall(r'[\u0561-\u0587\u0531-\u0556]+', text):
        t = t0.lower()
        if t in known or t in ex:
            continue
        s = re.sub(SUFF, '', t)
        if (s in kstem or s in ex or t.lower() in known or t.lower() in kstem
                or t.lower() in ex or re.sub(SUFF,'',t.lower()) in ex
                or re.sub(SUFF,'',t.lower()) in kstem):
            continue
        bad.append(t0)
    return sorted(set(bad))

def build(rid, after, title, text, it, newWords, questions, qLang='it', allow=()):
    extra = list(allow)
    for w in newWords:
        h = w['hy']
        extra += [h, re.sub(r'(ալ|ել)$', '', h), re.sub(r'(ալ|ել)$', 'ում', h),
                  h + 'ը', h + 'ն', h + 'ի', h + 'ում', h + 'ին', h + 'ից', h + 'ով', h + 'ներ']
        extra += w.get('formsInText', [])
    bad = validate(after, text + ' ' + title, extra)
    doc = {"id": rid, "title": "Lettura", "vocab": [],
           "steps": [{"type": "reading_test", "title": title, "text": text, "it": it,
                      "qLang": qLang,
                      "newWords": [{k: v for k, v in w.items() if k != 'formsInText'} for w in newWords],
                      "questions": questions}]}
    path = R + f'data/hy/lessons/{rid}.json'
    json.dump(doc, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    # conteggio occorrenze parole nuove
    occ = {}
    for w in newWords:
        stem = re.sub(r'(ալ|ել)$', '', w['hy'])
        occ[w['hy']] = len(re.findall(stem, text))
    return bad, occ

def register(rid, after, title, qLang='it'):
    p = R + 'data/hy/missions.json'
    m = json.load(open(p, encoding='utf-8'))
    m['missions'] = [x for x in m['missions'] if x['id'] != rid]
    m['missions'].append({"id": rid, "kind": "reading", "title": title,
                          "area": "Letture", "after": after, "icon": "📖", "qLang": qLang})
    json.dump(m, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
