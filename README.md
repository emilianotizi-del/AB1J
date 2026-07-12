# AB1J — Impara l'armeno orientale

Applicazione web mobile-first per imparare l'armeno orientale da zero al livello B1 (CEFR).
100% gratuita, senza backend, funziona offline (PWA).

## Caratteristiche

- Introduzione graduale dell'alfabeto armeno (39 lettere) con pratica di scrittura su canvas
- Script armeno, traslitterazione e IPA sempre affiancati (disattivabili)
- Esercizi interattivi: scelta multipla, abbinamento, tracciamento
- Flashcard con ripetizione dilazionata (algoritmo SM-2)
- Audio tramite sintesi vocale (voce armena, dove disponibile sul dispositivo)
- Progresso salvato in locale, con esportazione/importazione del backup
- Lezioni da 30 minuti, riducibili a 10 nelle impostazioni
- Tema chiaro/scuro
- Architettura modulare: motore e contenuti separati (i contenuti sono soli JSON)

## Pubblicazione su GitHub Pages

1. Crea il repository `AB1J` su GitHub.
2. Carica tutti i file di questa cartella nel branch `main`.
3. Su GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
4. L'app sarà disponibile su `https://<tuo-utente>.github.io/AB1J/`.
5. Dal telefono, apri l'URL e usa "Aggiungi a schermata Home" per installarla.

Tutti i percorsi sono relativi: l'app funziona in qualunque sottocartella senza configurazione.

## Struttura

```
index.html            Shell della SPA
manifest.json, sw.js  PWA e cache offline
css/                  base (token), componenti, schermate
js/core/              router, store (localStorage), srs (SM-2), audio, data
js/exercises/         plugin degli esercizi (teach, mcq, match, trace)
js/screens/           home, lesson, review, alphabet, stats, settings
data/hy/              contenuti (JSON): corso, alfabeto, lezioni
```

## Come aggiungere una lezione

1. Crea `data/hy/lessons/lNNN.json` (usa una lezione esistente come modello).
2. Aggiungi la voce corrispondente in `data/hy/course.json`.
3. Aggiorna `VERSION` in `sw.js` per invalidare la cache.

Nessun altro file va toccato: il motore legge tutto dai JSON.

## Come aggiungere un tipo di esercizio

1. Crea `js/exercises/mio-tipo.js` che esporta `render(step, mount, ctx)`.
2. Registralo in `js/exercises/registry.js`.

## Sviluppo locale

```
npx serve .
# oppure: python3 -m http.server
```

(Serve un server locale: i moduli ES e `fetch` non funzionano da `file://`.)

## Roadmap

- **Fase 2** — quiz di fine modulo, dettato, riordino frasi, statistiche estese
- **Fase 3** — alfabeto completo e corso A1 (~40 lezioni)
- **Fase 4** — corso A2 (grammatica: casi, aspetto verbale)
- **Fase 5** — corso B1, riconoscimento vocale nella sezione pronuncia
