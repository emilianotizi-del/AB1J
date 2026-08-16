# AB1J — Wishlist

Idee e miglioramenti futuri per AB1J. Non sono impegni: è un parcheggio ordinato
di cose emerse durante lo sviluppo e dalla **revisione indipendente** (ChatGPT,
richiesta da Emiliano). Contesto importante: **AB1J è un'app a uso personale.**
Molte critiche del revisore erano tarate su un corso pubblico con pretese di
certificazione CEFR — pertinenti *se e quando* l'app verrà diffusa, meno
urgenti finché resta personale. Qui sotto sono separate di conseguenza.

Ultimo aggiornamento: revisione indipendente ricevuta e triage completato.

---

## Fatto in risposta alla revisione

- **SRS inverso (produzione IT→armeno).** Aggiunta una terza carta per ogni
  parola: l'italiano davanti, si deve produrre l'armeno (rivelato dopo, con
  audio). Prima le carte partivano entrambe dall'armeno → si allenava solo
  riconoscimento. *Era la critica a più alto rendimento e l'abbiamo recepita.*
- **Correzione linguistica: articolo pre-vocalico.** «Երևանը ավելի…» →
  «Երևանն ավելի…» (l'articolo è -ն davanti a vocale, regola che il corso stesso
  insegna in l046: era un'incoerenza interna). Corretto in l078/l082/l093/l094.
- **Rinomina esami → "checkpoint".** Gli "esami A1/A2" ora sono "Checkpoint
  AB1J A1/A2": non sono valutazioni CEFR certificanti e non devono dichiararsi
  tali. Restano utili come verifica interna con soglia.
- **Verifica dell'ora «Ժամը հինգն անց կես է».** Il revisore la dava per errata;
  la verifica su fonte specializzata di armeno l'ha **confermata corretta**.
  Nessuna modifica. (Lezione: i giudizi linguistici puntuali di un LLM vanno
  sempre verificati — anche i più sicuri possono sbagliare.)

## Backup progressi — già presente

- Export/import del progresso in file JSON esiste già (Opzioni → Dati). Il
  rischio "cancello i dati del browser e perdo tutto" è quindi già mitigato.
  *Nota: valutare un promemoria periodico a fare il backup.*

---

## Da valutare — miglioramenti a costo medio, utili anche per uso personale

- **Più produzione attiva in A1.** Ogni unità potrebbe chiudersi con un piccolo
  compito in cui la risposta non è già visibile a schermo (es. un `write` senza
  tessere). Scaffolding mcq/match/order va bene *prima*, produzione *dopo*.
- **Lessico ricettivo nelle letture.** Separare vocabolario attivo (piccolo,
  consolidato nell'SRS) da vocabolario passivo (più ampio, incontrato in letture
  e dialoghi senza entrare nel mazzo). Per Emiliano conta di più perché **l'app
  è la sua unica fonte di armeno** — l'ambiente linguistico non deve essere
  troppo povero.
- **Regole grammaticali: distinguere euristica da regola assoluta.** Es. il
  plurale "una sillaba → -եր / più sillabe → -ներ" è un'euristica didattica con
  eccezioni, non una legge. Segnalare le eccezioni frequenti dove esistono, per
  non doverle "disimparare" al B1.
- **Verifica madrelingua del corpus.** Una revisione umana di testo, IPA,
  traslitterazione, naturalezza e audio delle 244 voci. NB: una madrelingua ha
  già segnalato a Emiliano che sono **in corso modifiche/semplificazioni nella
  lingua** → tenerne conto e usare fonti aggiornate.

## Da valutare — solo se un giorno l'app verrà diffusa pubblicamente

Queste erano critiche "ALTA" del revisore, ma presuppongono un corso pubblico
con pretese CEFR. Restano in lista, con quella condizione esplicita:

- **Approccio task-based / can-do.** Riorganizzare (o affiancare) l'impianto
  grammaticale-progressivo con unità costruite attorno a funzioni comunicative
  ("ordinare", "chiedere il prezzo", "prendere un appuntamento"). *Possibile
  forma: un'app separata o una sezione dedicata di AB1J, non una riscrittura
  dell'esistente.* → vedi sotto, "Idea: modalità task".
- **Assessment CEFR reale.** Test separati per reading/listening/writing/
  speaking con rubriche, invece del checkpoint a punteggio unico.
- **Voci reali / audit fonologico.** Una sola voce sintetica come unico modello
  fonologico è un limite; per un pubblico servirebbero parlanti madrelingua e
  varietà di voci/velocità.
- **Pragmatica.** Registro, cortesia, formule convenzionali, come si dice una
  cosa *davvero* (non solo in modo grammaticale). Indispensabile verso il B1.
- **Prosodia.** Accento, ritmo, intonazione (domanda vs affermazione): l'IPA
  delle singole parole non basta.
- **Accessibilità (WCAG).** Navigazione da tastiera, screen reader, contrasto,
  target touch, alternative a canvas/drag-and-drop, `prefers-reduced-motion`.
- **Chiave API nel browser.** Oggi è BYOK sperimetrata al dispositivo e
  dichiarata sperimentale: accettabile per uso personale. Per un pubblico,
  valutare un proxy serverless con credenziali lato server e rate limiting.

---

## Idea: modalità task (app o sezione separata)

Spunto dalla revisione: un percorso parallelo, orientato all'azione, dove
l'unità non è la regola grammaticale ma il compito comunicativo. Esempio di
task: "al mercato" = chiedi il prezzo → capisci la risposta → ordina a peso →
paga → ringrazia. La grammatica entra dentro il task, non prima. Terrebbe
separato l'approccio strutturale (AB1J attuale, che a Emiliano va bene così)
dall'approccio comunicativo, lasciando scegliere allo studente.

---

## Note tecniche minori

- Promemoria periodico per il backup del progresso.
- Valutare più avanti una seconda voce audio (variabile già predisposta nella
  pipeline).
- Corsivo manoscritto nel tracciamento (oggi solo forme a stampa).
