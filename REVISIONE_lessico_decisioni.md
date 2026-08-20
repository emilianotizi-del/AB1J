# Decisioni lessicali — esito della revisione esterna (audit EANC)

## Base dati
Frequency list EANC (`timarkh/uniparser-grammar-eastern-armenian`, `wordlists/eanc_wordlist.csv`):
1.475.479 forme, ~90M token. Lemmatizzata con `uniparser-eastern-armenian`
(top 12.000 forme -> 6.036 lemmi). Lessico app lemmatizzato con lo stesso analizzatore.

## Misure
| metrica | valore |
|---|---|
| voci in `vocab_full.txt` | 239 |
| di cui forme flesse | 26 |
| di cui chunk formulaici | 14 |
| **lemmi attivi reali** | **199** (+14 chunk) |
| copertura token EANC — solo attivo | 37,5% |
| copertura token EANC — attivo + ricettivo | 53,3% |
| buchi nei primi 800 lemmi | 538 (27,1% dei token) |

## Revisione: cosa è stato accettato
1. **Inversione del metodo di produzione.** Non "lettura -> 4 parole interessanti"
   ma "100 parole prioritarie -> letture scritte per farle incontrare". ACCETTATO.
2. **Normalizzazione per lemma** prima di qualsiasi confronto con soglie CEFR. ACCETTATO.
3. **Priorità a funzionali e verbi** sopra il lessico tematico. ACCETTATO, con quote
   ricavate dai dati (sotto) invece che dalle percentuali proposte a stima.

## Revisione: cosa è stato corretto
1. **Metà degli esempi citati come "mancanti" sono ricettivi, non assenti**
   (`համար`, `հետ`, `այս`, `կարող`, `պետք`). Vanno *promossi*, non introdotti.
   Il revisore vedeva solo `vocab_full.txt`, non il corpus dell'app.
2. **L'EANC è scritto/letterario dal metà-Ottocento.** Nella top-120 compaiono
   `քաղաքական`, `ՀՀ`, `Հայաստանի`, passati narrativi. La frequenza si usa come
   **filtro di esclusione**, non come criterio di inclusione.
3. **Confusione lessico/grammatica.** `չի`, `չէր`, `չեն`, `նրան`, `նրանց`, `իրենց`,
   `որը`, `որի` sono paradigmi. Decisione: vanno nell'SRS come carte di grammatica,
   **fuori dal conteggio delle 100**.
4. **KPI 500-700 lemmi attivi**: importato da stime inglese/francese che lo stesso
   revisore dichiara non validate per l'armeno. Tenuto come orizzonte, non come vincolo.
5. **Quota "lessico delle missioni" (15%) superflua**: tutto il lessico che le missioni
   richiedono è già nel corpus dell'app; è materiale da promozione, non da aggiunta.

## Allocazione dei 100 slot (ricavata dai dati)
Copertura media per parola, sui buchi nei primi 1200 lemmi:
PRON 0,121% · CONJ 0,071% · POST 0,059% · PART 0,044% · ADV 0,037% · V 0,033% · N 0,031%.
I funzionali rendono 3-4 volte un nome, ma sono un insieme chiuso e quasi esaurito a 25.
I verbi sono il deficit strutturale (13 attivi = 5,4%).

| categoria | slot | motivazione |
|---|---|---|
| verbi | 35 | porta la quota verbale dal 5,4% al 16% |
| funzionali | 25 | esaurisce l'insieme chiuso mancante ad alta frequenza |
| avverbi/aggettivi general-purpose | 20 | funzioni valutative e modali assenti |
| nomi ad alta frequenza | 20 | solo lemmi nei primi ~500 |

**31 delle 100 sono promozioni** (già incontrate nelle missioni), 69 nuove.

## Impatto atteso
Copertura attiva dei token EANC: **37,5% -> 53,2%**.
Quota verbale dell'attivo: **5,4% -> 16%**.

## File prodotti
- `data/hy/lexicon_priority.json` — le 100 parole con rank EANC, copertura, stato.
- `data/hy/reading_lexicon_plan.json` — le 100 distribuite in 25 gruppi da 4,
  ordinate per frequenza decrescente: la lettura 1 riceve le parole più frequenti.

## Vincolo di produzione delle letture
Ogni lettura va scritta **attorno alle sue 4 parole assegnate**, non viceversa.
Le parole già viste in missione (`stato: promozione`) possono comparire senza
preavviso; le `nuova` vanno introdotte in contesto trasparente.
