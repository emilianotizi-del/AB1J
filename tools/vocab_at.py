# tools/vocab_at.py — vocabolario disponibile a una data lezione del corso
import json,re,sys,os

# Punteggiatura armena intra-parola: ՞ interrogativo, ՛ enfasi, ՜ esclamativo.
# Va rimossa prima di estrarre le forme, altrimenti «Ի՞նչ» entra nel vocabolario
# come «Ի» + «նչ» e la parola vera «ինչ» risulta mai insegnata.
INTRAWORD = '\u055E\u055B\u055C'
LETTERS   = '\u0561-\u0587\u0531-\u0556'
REPO=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..")+"/"
c=json.load(open(REPO+'data/hy/course.json',encoding='utf-8'))
seq=[]
for m in c['modules']:
    for l in m['lessons']: seq.append(l if isinstance(l,str) else l['id'])
def forms(lid):
    txt=""
    for x in seq[:seq.index(lid)+1]:
        try: txt+=open(REPO+f'data/hy/lessons/{x}.json',encoding='utf-8').read()
        except: pass
    # includo le letture-prototipo già collocate prima di lid
    import glob, json as _j
    try:
        _m=_j.load(open(REPO+'data/hy/missions.json',encoding='utf-8'))
        for r in _m['missions']:
            if r.get('kind')=='reading' and r.get('after') in seq[:seq.index(lid)+1]:
                txt+=open(REPO+f"data/hy/lessons/{r['id']}.json",encoding='utf-8').read()
    except Exception: pass
    raw = re.findall(f'[{LETTERS}{INTRAWORD}]+', txt)
    ok = {re.sub(f'[{INTRAWORD}]', '', w) for w in raw}
    ok = {w for w in ok if len(w) > 1}
    ok|={'է','ու','և','ա','ի','ը','ոչ','այո','մի','չէ'}
    return sorted(ok)
if __name__=='__main__':
    f=forms(sys.argv[1]); print(len(f)); print(' '.join(f))
