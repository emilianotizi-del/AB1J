# STATO.md — Punto di lavoro di AB1J

Ultimo aggiornamento: fine sessione di sviluppo (chat interrotta per problema
tecnico di upload). Questo file serve a far ripartire una NUOVA chat con il
quadro completo. Leggi anche `SYLLABUS.md` e `WISHLIST.md`.

## Cos'è AB1J
App mobile-first (PWA) per l'autoapprendimento dell'armeno orientale (A0→B1),
per Emiliano, adulto italofono, uso PERSONALE. Gratuita, offline, no backend,
HTML/CSS/JS puro, su GitHub Pages. Comunicazione in ITALIANO. Emiliano non è
programmatore: spiegare i termini tecnici. Preferenza esplicita: DIAGNOSI prima
delle correzioni.

- Repo: **emilianotizi-del/AB1J** · Live: https://emilianotizi-del.github.io/AB1J/
- Working dir: `/home/claude/AB1J` · Deploy via git con token fine-grained
- Service worker: incrementare VERSION a ogni release (attuale: **ab1j-v49**)
- Pipeline audio: GitHub Action ElevenLabs (voce Antoni `ErXwobaYiN019PkySvjV`,
  modello eleven_v3). Dopo un commit con testo nuovo, attendere ~2min e
  verificare `data/hy/audio/_last_log.txt`.
- Linter: `node tools/lint_content.js` (controlla anche caratteri latini nel
  testo armeno di missioni e letture). Audit audio: `python3 tools/audit_audio.py`.

## Stato attuale (COMPLETATO)
- **Corso A0+A1+A2 completo**: 94 lezioni, 20 moduli. Checkpoint A1 (l059) e A2 (l094).
- **32 Missioni** task-based (`mission_*.json`), 6 archetipi, iniziativa studente,
  communication repair, replay a scaffolding decrescente. Nella tab-bar (🎯).
- **SRS a 3 carte** per parola (lettura/significato/produzione IT→HY). La carta
  produzione usa il campo di input di sistema (tastiera armena iPhone), con
  confronto lettera-per-lettera e stesso font (sans).
- **Traduzione italiana a 3 stati** (Sempre/Solo nuove/Mai). Le RISPOSTE e le
  CONSEGNE non si nascondono mai; solo gli aiuti.
- **Lettere difficili** (ձժջչճզծշ): schermata con 10-20 parole per lettera +
  esercizio "confondibili" (gruppi ts/dz, ch, sh/zh; ց inclusa come distrattore).
  PDF A4 scaricabile (`/tmp/AB1J_lettere_difficili.pdf`, rigenerabile).
- **Letture** (`reading_*.json`): nuovo tipo `reading_test` dentro le Missioni.
  Testo armeno + 4 domande a 3 opzioni. Sigla LXX (numero lezione), colore blu,
  sblocco per LEZIONE, ordinamento mescolato alle missioni. Parole nuove (4 per
  lettura) deducibili dal contesto → entrano nel ripasso SRS. Domande in IT fino
  al modulo 9, in ARMENO dal modulo 10.
  - Fatte finora: 3 prototipi — reading_l020 (domande IT), reading_l048
    (prova HY, agganciata a lezione già superata), reading_l050 (domande HY).

## LAVORO IN CORSO — le 25 letture
Decisione presa: **25 letture** totali (~una per modulo) sull'arco A0-A2.
- Domande in ITALIANO fino al modulo 9, in ARMENO dal modulo 10.
- Ogni lettura: 4 parole nuove attive (deducibili dal contesto) → nel ripasso.
- Produrre a blocchi di 4-5, verificando audio per blocco.
- I 3 prototipi esistenti valgono come prime letture del set.
- **NON ancora prodotte le ~22 letture restanti**: si attende la revisione del
  lessico (sotto) per decidere CON QUALE CRITERIO scegliere le ~100 parole nuove.

## LAVORO IN CORSO — revisione esterna del LESSICO
Preparati e nel repo: `REVISIONE_lessico_prompt.md`, `REVISIONE_lessico_dossier.md`,
`vocab_full.txt` (lista completa delle ~240 parole attive).
- Domanda centrale: ~340 parole attive (+~370 ricettive dalle missioni) bastano
  per un A2 personale? Con quale criterio scegliere le ~100 parole nuove delle
  letture?
- **Il giudizio del revisore (ChatGPT) NON è ancora stato acquisito**: durante la
  sessione l'upload del testo falliva (arrivava vuoto). Emiliano lo re-invierà
  nella nuova chat. Da analizzare criticamente (filtrare fondato vs generico;
  i giudizi puntuali sull'armeno vanno verificati, quelli sui principi lessicali
  sono affidabili).

## Dati vocabolario (calcolati)
- Attivo (SRS): A0=41, A1=+117 (cum 158), A2=+63 (cum 221), +letture ≈ 239.
- Ricettivo (nelle 32 missioni, non nel ripasso): ~370 parole aggiuntive.
- Con le 25 letture: attivo salirebbe a ~340.

## Metodo di lavoro con le revisioni
Non delegare la decisione al revisore: sottoporgli un PIANO già nostro da
stress-testare. Filtrare: le critiche STRUTTURALI/di principio sono preziose, i
giudizi LINGUISTICI puntuali di un LLM vanno SEMPRE verificati (in passato il
revisore ha sbagliato con sicurezza su una forma dell'ora poi confermata giusta).

## Verifica madrelingua
Emiliano sottopone AUTONOMAMENTE tutto il materiale nuovo (missioni, letture,
parole delle lettere difficili) a una madrelingua. NON serve ricordarglielo.

## Punti aperti minori
- Le 25 letture (22 da fare) dopo la revisione lessico.
- B1 (moduli 21-28) come fase futura del curriculum.
- Wishlist "se pubblicata": task-based totale, WCAG, voci reali, ecc.

## Nota su comunicazione
Rispondere in italiano, conciso, diagnosi prima delle correzioni. Codice: path
del file come commento in prima riga. NON ricordare a Emiliano di revocare il
token (sua richiesta esplicita) né la verifica madrelingua.

## Sessione lessico + letture (agosto 2026)

- **Audit lessicale su EANC** (1.475.479 forme, ~90M token, lemmatizzate con
  `uniparser-eastern-armenian`). Copertura attiva misurata: 37,5%.
  Lemmi attivi reali: 199 (+14 chunk), non 239. Vedi `REVISIONE_lessico_decisioni.md`.
- **25 letture nuove** (l051→l092), 100 parole prioritarie scelte per frequenza,
  nessun duplicato. Piano in `data/hy/reading_lexicon_plan.json`.
  Attese: attivo 199→299 lemmi, verbi 5,4%→16%, copertura 37,5%→53,2%.
- **7 lezioni nuove** per le lacune del curriculum (`REVISIONE_lacune_piano.md`):
  `l024n`, `l036n`, `l055n`, `l064n`, `l069n` (negazione distribuita per tempo),
  `l026b` (locativi lessicalizzati), `l043p` (pronomi obliqui).
  Nessun id esistente è stato rinumerato. Lezioni totali: 94 → 101.
- **10 parole di servizio** aggiunte come lessico ricettivo (passi `extra`)
  in l062, l063, l067, l076, l079, l081, l084, l086, l088, l091.
- **Validatore** in `tools/reading_validator.py` + `tools/vocab_at.py`:
  confronta ogni token di un testo con il vocabolario e la grammatica
  effettivamente disponibili a quel punto del corso. Da usare per ogni
  nuovo contenuto.
