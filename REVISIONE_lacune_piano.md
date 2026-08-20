# Piano di rimedio alle lacune del curriculum

Proposta operativa, da validare prima di scrivere codice o contenuti.
Le lacune sono descritte in `REVISIONE_lacune_curriculum.md`.

---

## Principio guida

Il corso attuale ha 20 moduli e 94 lezioni, e la numerazione `lNNN` è
referenziata da `course.json`, da `missions.json` (campo `after`) e dai 28 file
di lettura. **Rinumerare è la cosa da non fare**: romperebbe tutti i prerequisiti
di sblocco. Ogni proposta qui sotto usa identificatori nuovi e non tocca quelli esistenti.

---

## Intervento 1 — La negazione (priorità massima)

**Problema**: le forme in `չ-` sono il 2,03% dei token EANC. Il corso le tratta a l084.

**Non funziona**: aggiungere un modulo unico sulla negazione. La negazione non è
un argomento, è una proprietà di ogni tempo verbale: insegnarla in blocco a metà
corso lascerebbe comunque scoperto tutto ciò che viene prima.

**Proposta — inserimento distribuito.** Una lezione breve (4-6 passi) subito dopo
ogni lezione che introduce un tempo verbale:

| nuova lezione | dopo | contenuto |
|---|---|---|
| `l024n` | l024 (presente) | `չեմ / չես / չի / չենք / չեք / չեն` + `չկա` |
| `l036n` | l036 (avere) | `չունեմ / չունես / չունի…` |
| `l055n` | l055 (passato) | negazione del passato: `չգնացի`, `չասաց` |
| `l064n` | l064 (imperfetto) | `չէի / չէիր / չէր…` |
| `l069n` | l069 (futuro) | `չեմ գնա`, `չի գա` |

Cinque lezioni brevi, non un modulo. Costo di produzione basso, impatto massimo.

**Effetto sulle letture**: nessuna riscrittura necessaria. Le 25 letture sono
già scritte in positivo; dopo l'intervento le successive potranno usare la negazione,
e alcune delle esistenti potranno essere arricchite in un secondo momento.

---

## Intervento 2 — Anticipare il locativo

**Problema**: `-ում` a l075; «al mercato», «in città», «a scuola» impossibili
per tre quarti del corso.

**Due opzioni.**

**(a) Sposta il locativo** dal modulo m16 al modulo m11 (subito dopo il genitivo,
l050). Coerente linguisticamente: locativo e genitivo condividono il tema obliquo.
Richiede però di riordinare m16 e di verificare che nessuna lezione precedente
dipenda dal locativo.

**(b) Blocchi lessicalizzati anticipati** — una lezione nuova `l026b` che insegna
`տանը`, `քաղաքում`, `դպրոցում`, `շուկայում` come forme da memorizzare, senza
regola, rimandando la spiegazione a l075.

**Raccomandazione: (b)**, poi (a) se l'esperimento funziona. (b) non tocca
l'architettura ed è reversibile; (a) è più pulita ma più rischiosa.

---

## Intervento 3 — Lessico di servizio della narrazione

**Problema**: `պատմություն`, `տղա`, `ամբողջ`, `այդպես`, `այնքան`, `գյուղ`, `սիրտ`,
`ընկնել`, `կատարել`, `որպես` — tutte nei primi 400 lemmi EANC, tutte assenti.

**Proposta**: **non** entrano nell'SRS (i 100 slot sono chiusi e assegnati).
Vanno distribuite come lessico ricettivo dentro lezioni già esistenti,
2-3 parole per lezione, nei moduli m13-m19. Nessuna carta nuova, nessun
aumento del carico di ripasso; diventano solo disponibili per i testi futuri.

---

## Intervento 4 — Pronomi obliqui come paradigma

**Problema**: `ինձ`, `քեզ`, `նրան`, `մեզ`, `ձեզ`, `նրանց`, `իրեն` compaiono
sparsi, mai come sistema. `նրան` è al rank 87 EANC.

**Proposta**: una lezione nuova `l043p`, dopo l043 (`-ս` e `-դ`), che presenta
la tabella completa. Le carte vanno nell'SRS come **grammatica**, fuori dal
conteggio delle 100 — coerente con la decisione già presa.

---

## Ordine di esecuzione consigliato

1. `l024n` (negazione al presente) — sblocca subito il resto del corso
2. `l043p` (pronomi obliqui)
3. `l026b` (locativi lessicalizzati)
4. Le altre quattro lezioni di negazione, in ordine di corso
5. Distribuzione del lessico di servizio (lavoro diffuso, ultimo)

**Stima**: 7 lezioni nuove brevi + un passaggio di editing diffuso.
Nessuna modifica ai 94 identificatori esistenti, nessuna riscrittura delle 28 letture.

---

## Verifica

Il validatore usato per le letture (`/home/claude/work/mkreading.py`,
funzione `validate`) va portato nel repo sotto `tools/` e usato anche per le
nuove lezioni: confronta ogni token con il vocabolario e la grammatica
effettivamente disponibili a quel punto del corso. È lo strumento che ha
intercettato tutte le lacune elencate.
