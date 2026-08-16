# AB1J — Dossier di progetto per revisione indipendente

App web gratuita per l'autoapprendimento dell'**armeno orientale**, dal principiante
assoluto (A0) verso il B1 del CEFR. Progetto personale, non commerciale.
Codice pubblico: https://github.com/emilianotizi-del/AB1J
App live: https://emilianotizi-del.github.io/AB1J/

---

## 1. Obiettivo e vincoli

- Insegnare armeno orientale (ortografia riformata della Repubblica d'Armenia)
  a partenti italofoni, in autoapprendimento su smartphone.
- **Vincoli autoimposti:** gratuita per tutti, nessun backend, solo
  HTML/CSS/JavaScript statico ospitato su GitHub Pages, funzionamento offline,
  mobile-first, architettura modulare ed espandibile.
- Progressi dell'utente salvati **solo sul dispositivo** (localStorage); nessun
  account, nessuna raccolta dati.

## 2. Stato attuale (dati reali)

- **20 moduli, 94 lezioni.** Livelli: alfabeto (A0), A1 completo, A2 completo.
  Esami di fine livello (A1 e A2) con soglia di superamento dell'80%.
- **~1040 passi di esercizio**; **244 voci** di lessico, ciascuna sdoppiata in
  2 carte di ripasso (→ 488 carte).
- **604 tracce audio** neurali (di cui 45 in versione rallentata per l'ascolto).
- ~32 file JavaScript, ~2000 righe.

## 3. Impianto didattico

**Alfabeto prima di tutto.** Le 39 lettere (+ digramma ու) sono introdotte per
gruppi; regola ferrea: **ogni parola usa solo lettere già insegnate** (verificata
da uno script di lint automatico). Eccezioni fonetiche insegnate esplicitamente:
ե = [ye] a inizio parola, ո = [vo] a inizio parola, ը [ə] spesso non scritta.

**Progressione grammaticale (sintesi):**
- A1: presente (-ում + essere, tutte le persone), plurale (-եր/-ներ), articolo
  determinativo (-ը/-ն), possessivi suffissi (-ս/-դ), genitivo (-ի) e dativo
  (-ին), verbi speciali ունեմ/գիտեմ, imperativo singolare, primo passato
  (aoristo, 3 persone).
- A2: aoristo completo (6 persone) + irregolari (ասաց, եղավ, տվեց), imperfetto
  (-ում էի), futuro (կ-), i tre casi restanti (ablativo -ից, strumentale -ով,
  locativo -ում), comparativo (ավելի…քան) e superlativo (ամենա-), connettivi
  subordinanti (որ, որովհետև, եթե, բայց), imperativo plurale e negativo (մի՛).

**Lessico** per campi tematici (famiglia, cibo, città, lavoro, salute, viaggi,
meteo), con crescita controllata (244 voci totali A0→A2, scelta deliberata:
consolidamento sopra quantità).

**Cultura** integrata come letture da A2: geografia d'Armenia, Yerevan "città
rosa", ospitalità e rituale del brindisi (tamada).

## 4. Tipi di esercizio (con frequenza reale d'uso)

| Tipo | Cosa fa | Valutato? | N. |
|---|---|---|---|
| teach | presenta parola/regola con audio, IPA, nota | no | 294 |
| mcq | scelta multipla | sì | 206 |
| cloze | frase con lacuna, scelta della forma | sì | 149 |
| write | **scrittura digitata** con tastiera armena interna | sì | 92 |
| order | riordino di tessere in frase | sì | 72 |
| listen | **ascolto cieco**: solo audio, testo rivelato dopo | sì | 58 |
| match | abbinamento | sì | 55 |
| dictation | dettato lettera per lettera | sì | 41 |
| trace | tracciamento del glifo (canvas), maiusc. e minusc. | sì | 31 |
| conjugate | tabella di coniugazione da completare | sì | 16 |
| dialog | dialogo ascoltabile | no | 10 |
| notice | avviso/richiamo informativo | no | 9 |
| reading | lettura estesa con traduzione | no | 6 |

**Distinzione dichiarata:** A1 orientato al *riconoscimento* (mcq, match,
order); A2 introduce la *produzione* (write con tastiera propria, listen senza
testo, cloze e conjugate a maggior carico). I moduli A1 più vecchi, inizialmente
poveri, sono stati arricchiti a posteriori con cloze/write/listen quando l'utente
ha notato che alcune regole (es. il plurale) si potevano risolvere per
somiglianza visiva invece che applicando la regola.

**Ripasso a ripetizione dilazionata (SRS, algoritmo SM-2).** Ogni parola genera
DUE carte indipendenti: una di *lettura* (armeno → traslitterazione/IPA/audio) e
una di *significato* (armeno → traduzione), programmate separatamente, distinte
anche per colore.

## 5. Audio e riconoscimento vocale

- **Sintesi vocale neurale** (ElevenLabs, un solo modello che supporta l'armeno;
  voce maschile unica). Tracce pre-generate via automazione e servite come file
  statici. Controlli di qualità automatici sulla durata (proporzionata alla
  lunghezza del testo, con soglie più severe per parole corte, che tendevano a
  produrre tracce mute).
- **Ascolto rallentato**: per l'ascolto cieco esiste una seconda traccia
  pronunciata più lenta (perché iOS ignora il rallentamento della riproduzione).
- **Riconoscimento vocale** (allenamento di pronuncia): funzione *opzionale*.
  Chi inserisce una propria chiave API ottiene la trascrizione della propria voce
  e un punteggio di somiglianza; senza chiave, si resta in "modalità eco"
  (ascolta, ripeti, autovaluta). La chiave vive solo sul dispositivo. Nota: il
  riconoscimento è meno affidabile su parole isolate corte (limite noto dei
  sistemi STT), mitigato chiedendo la doppia ripetizione e confrontando per
  finestre di parole.

## 6. Esempi concreti di contenuto (per valutare la correttezza linguistica)

- Plurale: օր → օրեր (una sillaba, -եր); խնձոր → խնձորներ (più sillabe, -ներ).
- Presente: «Ես հայերեն եմ սովորում» (sto imparando l'armeno).
- Possessivo suffisso: «Անունս Աննա է» (mi chiamo Anna).
- Ora: «Ժամը հինգն անց կես է» (sono le cinque e mezza); dativo di tempo
  «ժամը հինգին» (alle cinque).
- Genitivo/dativo: «Դավիթի տունը» (la casa di Davide); «Ես Աննային հաց եմ տալիս»
  (do il pane ad Anna); oggetto animato in -ին: «Ես Դավիթին եմ տեսնում».
- Aoristo completo: խմեցի/խմեցիր/խմեց/խմեցինք/խմեցիք/խմեցին.
- Imperfetto: «Երբ փոքր էի, շատ կաթ էի խմում» (da bambino bevevo molto latte).
- Futuro: «Վաղը շուկա կգնամ» (domani andrò al mercato).
- Casi: «Ես Իտալիայից եմ, բայց Երևանում եմ ապրում» (sono dall'Italia ma vivo a
  Yerevan); «Ոտքով եմ գնում» (vado a piedi).
- Comparativo: «Երևանը ավելի մեծ է քան Գյումրին».
- Subordinata: «Կարծում եմ, որ վաղը անձրև կգա» (penso che domani pioverà);
  «Ուզում եմ գալ, բայց չեմ կարող» (voglio venire ma non posso).
- Cultura (lettura): «Երևանը կոչվում է վարդագույն քաղաք» (Yerevan è chiamata la
  città rosa).

## 7. Strumenti di qualità del progetto

- **Lint dei contenuti** automatico: verifica la regola delle lettere, l'assenza
  di distrattori ambigui (es. un distrattore di dettato già presente nella
  parola), la presenza di audio per ogni testo pronunciabile, la coerenza dei
  campi.
- **Audit audio** automatico: intercetta tracce degeneri o troppo brevi.
- **Documento di syllabus** versionato nel repository come fonte unica delle
  decisioni didattiche, con una sezione di "punti aperti" dalla revisione già
  fatta rispetto agli standard.

## 8. Limiti già noti e dichiarati (dal syllabus, sezione "punti aperti")

Confronto già effettuato internamente con CEFR/Companion Volume 2020 e con un
modello prototipale per l'armeno L2. Deficit residui riconosciuti, in ordine di
costo crescente di soluzione:

1. Obiettivi "can-do" espliciti per lezione e autovalutazione dello studente —
   assenti.
2. Note culturali: presenti da A2, non nell'A1.
3. Varietà di input audio: **una sola voce, sintetica** (gli standard chiedono
   voci/velocità/generi diversi).
4. **Interazione in tempo reale** (parlare con un interlocutore): strutturalmente
   fuori portata per un'app self-study senza componente umana — quindi ciò che
   il progetto chiama "A2 completato" è A2 di ricezione e produzione guidata, non
   certificabile sulle quattro attività CEFR (ricezione, produzione, interazione,
   mediazione).
5. **Mediazione** (CEFR Companion Volume): assente.
6. Forme corsive manoscritte: il tracciamento usa le forme a stampa.
7. Comprensione orale autentica: l'audio è sempre TTS di studio, senza parlato
   reale a velocità naturale con rumore/varianti.

## 9. Domande su cui si desidera in particolare un parere

- La correttezza dell'armeno negli esempi riportati.
- Se la crescita lessicale controllata (244 voci per arrivare a fine A2) sia
  troppo prudente rispetto agli obiettivi CEFR (che indicano numeri più alti).
- Se la strategia "riconoscimento in A1, produzione in A2" sia didatticamente
  fondata o se la produzione andrebbe anticipata.
- Se i limiti dichiarati al punto 8 siano davvero i più importanti, o se ne
  manchino di più gravi.
