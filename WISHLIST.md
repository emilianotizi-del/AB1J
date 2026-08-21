# AB1J — Wishlist

Parcheggio ordinato di idee e miglioramenti. Non sono impegni.

**Contesto**: AB1J è un'app a uso personale ed è l'unica fonte di armeno di
Emiliano. Molte critiche della revisione indipendente (ChatGPT) erano tarate su
un corso pubblico con pretese CEFR: pertinenti *se e quando* l'app verrà
diffusa, meno urgenti finché resta personale. Sotto sono separate di conseguenza.

**Stato al 21/08/2026**: 101 lezioni in 20 moduli · 32 missioni task-based ·
28 letture · SRS a tre tipi di carta · copertura lessicale attiva 37,5%,
attesa 53,2% a fine percorso.

---

## Fatto

- **SRS inverso (produzione IT→armeno)**, con input di sistema e diff carattere
  per carattere. *Era la critica a più alto rendimento della revisione.*
- **Approccio task-based / can-do** — 32 missioni, sei archetipi conversazionali
  (transaction, social, info_gap, problem, negotiation, narrative), iniziativa
  dello studente, riparazione comunicativa («🙋 Չhaskaca»), replay a
  scaffolding decrescente. *Era in wishlist come ipotesi: è in produzione.*
- **Articolo pre-vocalico** corretto in l078/l082/l093/l094 (`Երևանն ավելի`).
- **Esami rinominati «checkpoint»**: non sono valutazioni CEFR certificanti.
- **Export/import del progresso** in JSON (Opzioni → Dati).
- **Audit lessicale su corpus reale (EANC, ~90M token)** e 25 letture costruite
  su 100 parole scelte per frequenza. Vedi `REVISIONE_lessico_decisioni.md`.
- **7 lezioni per le lacune del curriculum**: negazione distribuita per tempo
  verbale, locativi lessicalizzati, pronomi obliqui.
  Vedi `REVISIONE_lacune_piano.md`.
- **Validatore di sequenza** (`tools/reading_validator.py`): confronta ogni
  token con vocabolario e grammatica disponibili a quel punto del corso.
- **Verifica dell'ora «Ժամը հինգն անց կես է»**: il revisore la dava per errata,
  la verifica su fonte specializzata l'ha confermata **corretta**.
  *Lezione: i giudizi linguistici puntuali di un LLM vanno sempre verificati.*

---

## Bloccato — in attesa di condizioni esterne

### Audio: 76 tracce da rigenerare
Quota ElevenLabs esaurita nel run del 21/08/2026 (`quota_exceeded`, 0 crediti
su 10.000). Le 76 voci sono state rimosse da `data/hy/audio/index.json` per
evitare richieste verso file inesistenti, e conservate in
`data/hy/audio/_pending.json`.

**Al rinnovo dei crediti** (mensile):
1. GitHub → Actions → «Genera audio (ElevenLabs)» → Run workflow.
   L'Action rigenera da sé: non serve reimportare `_pending.json`.
2. `node tools/lint_content.js` → «Testi senza audio» deve essere 0.
3. Cancellare `_pending.json`.

Costo stimato ~500 crediti. Riguarda quasi tutte le 7 lezioni nuove e le 10
parole di servizio. Fino ad allora l'icona altoparlante resta visibile ma muta
su iOS, che non ha voce armena di sistema.

---

## Da fare — ordine consigliato

### 1. Collaudo sul telefono di quanto prodotto
33 file di contenuto nuovi (25 letture + 7 lezioni + 1 piano) non sono **mai
stati aperti nell'app**. Prima di aggiungere altro: percorrere l024n, l043p,
una lettura iniziale (l051) e una finale (l092), verificare rendering, domande,
ingresso delle parole nell'SRS, sblocco dei prerequisiti.

### 2. Linter: controllare i file, non l'indice
`tools/lint_content.js` conta le voci di `index.json`. Se indice e disco
divergono dice «0 senza audio» mentre le tracce mancano — è successo davvero.
Deve verificare l'esistenza dei `.mp3`.

### 3. ~~Letture per la prima metà del corso~~ — FATTO (21/08/2026)
6 letture di solo ripasso in m05-m10 (l025, l029, l034, l039, l044, l049):
`newWords` vuoto, nessuno slot SRS consumato, 52-73 parole ciascuna.
Servono a leggere, non ad ampliare. Letture totali: 34.

### 4. Più produzione attiva in A1
Chiudere le unità con un compito in cui la risposta non è visibile a schermo
(`write` senza tessere). Scaffolding mcq/match/order *prima*, produzione *dopo*.

### 5. Lettura estensiva con glossa a tocco — la leva del B1
Misurato sull'EANC: la copertura all'80% richiede **872 lemmi**, ~570 più di
quelli previsti a fine A2. Come flashcard è insostenibile.
Meccanismo proposto: testi lunghi dove le parole nuove **non** entrano
nell'SRS ma sono toccabili per la traduzione, e vengono promosse al ripasso
solo dopo N tocchi — promozione guidata dal comportamento, non decisa a priori.
Riusa `reading_test`. È l'intervento con il maggior ritorno verso il B1.

### 6. Carte di grammatica per i paradigmi
`չի`, `չեմ`, `նրան`, `որը`, `իրենց`: nell'SRS come carte di grammatica, fuori
dal conteggio delle 100 parole. Decisione già presa, non ancora implementata.

### 7. Verifica madrelingua del corpus
Testo, IPA, traslitterazione, naturalezza, audio. **NB**: una madrelingua ha
già segnalato che sono in corso semplificazioni nella lingua → usare fonti
aggiornate.

### 8. Regole vs euristiche
Il plurale «una sillaba → -եր / più sillabe → -ներ» è un'euristica con
eccezioni, non una legge. Segnalarle dove esistono, per non doverle
disimparare al B1.

### 9. Corpus orale per tarare il B1
Tutte le misure di copertura vengono dall'EANC, che è **scritto e letterario
dal metà-Ottocento**. Per un B1 orientato al parlato la curva è probabilmente
più favorevole, ma non lo sappiamo. Prima di fissare obiettivi B1 numerici
converrebbe cercare un corpus parlato di armeno orientale.

### 10. Minori
- Promemoria periodico per il backup del progresso.
- Seconda voce audio (variabile già predisposta nella pipeline).
- Corsivo manoscritto nel tracciamento (oggi solo forme a stampa).

---

## Solo se l'app verrà diffusa pubblicamente

Critiche «ALTA» della revisione che presuppongono un corso pubblico con
pretese CEFR:

- **Assessment CEFR reale**: test separati per reading/listening/writing/
  speaking con rubriche, invece del checkpoint a punteggio unico.
- **Voci reali / audit fonologico**: una sola voce sintetica come unico modello
  è un limite; servirebbero parlanti madrelingua e varietà di voci e velocità.
- **Pragmatica**: registro, cortesia, formule convenzionali — come si dice una
  cosa *davvero*, non solo in modo grammaticale. Indispensabile verso il B1.
- **Prosodia**: accento, ritmo, intonazione (domanda vs affermazione).
  L'IPA delle singole parole non basta.
- **Accessibilità (WCAG)**: tastiera, screen reader, contrasto, target touch,
  alternative a canvas e drag-and-drop, `prefers-reduced-motion`.
- **Chiave API nel browser**: oggi BYOK confinata al dispositivo e dichiarata
  sperimentale, accettabile per uso personale. Per un pubblico servirebbe un
  proxy serverless con credenziali lato server e rate limiting.
