# Lacune del curriculum emerse durante la produzione delle letture

Queste lacune non vengono da un'analisi teorica: sono i punti in cui, scrivendo
testi armeni corretti e naturali, il validatore ha bloccato una formulazione
**perché il corso non aveva ancora insegnato lo strumento necessario**.
Ognuna ha richiesto un aggiramento, cioè una frase peggiore di quella giusta.

---

## 1. La negazione — GRAVE

**Stato attuale**: la prima forma negativa compare a `l065` (`չգիտեի`, di passaggio,
senza spiegazione). Il paradigma viene trattato solo a `l084`/`l088`.

**Peso reale**: le forme in `չ-` sono il **2,03% di tutti i token** dell'EANC
(~1,8 milioni di occorrenze su 90 milioni). È più frequente di quasi qualunque
singola parola del lessico.

**Conseguenza pratica**: per 84 lezioni su 94 lo studente non può dire *no*.
Nelle letture ho dovuto riscrivere in positivo frasi elementari:
«il libro non era là» → «il libro mancava»; «non c'era sole» → tolto del tutto;
«non ho trovato i soldi» → «i soldi sono rimasti sul tavolo».

**Proposta**: nuovo modulo breve subito dopo `l024` (presente), con
`չեմ / չես / չէ / չենք / չեք / չեն`, poi `չկա`, poi la negazione dei tempi
passati quando questi vengono introdotti. La negazione va insegnata **insieme**
a ogni tempo verbale, non come argomento separato a fine corso.

---

## 2. Il locativo troppo tardi — MEDIA/ALTA

**Stato attuale**: locativo `-ում` a `l075`.

**Conseguenza**: «al mercato», «in città», «a scuola» — i complementi di luogo
più comuni — sono impronunciabili per tre quarti del corso. Ho dovuto usare
il nominativo (`շուկա գնացի`), che regge solo con i verbi di moto: per
«al mercato ho visto» non esiste alternativa corretta.

**Proposta**: anticipare il locativo subito dopo il genitivo (`l050`), oppure
introdurre prima almeno le forme lessicalizzate più frequenti
(`տանը`, `քաղաքում`, `դպրոցում`) come blocchi da memorizzare.

---

## 3. Parole di servizio della narrazione — MEDIA

Assenti dal corso e mai pianificate, ma indispensabili per scrivere qualunque testo:

| parola | significato | nota |
|---|---|---|
| `պատմություն` | storia, racconto | serve in ogni lettura |
| `տղա` | ragazzo, figlio | c'è `աղջիկ` (pianificata) ma non il maschile |
| `ամբողջ` | intero, tutto | rank EANC 170 |
| `այդպես` / `այնպես` | così | rank 182 / 162 |
| `այնքան` | tanto, così tanto | rank 166 |
| `գյուղ` | villaggio | rank 175 |
| `սիրտ` | cuore | rank 172 |
| `ընկնել` | cadere | rank 130 |
| `կատարել` | compiere, svolgere | rank 154 |
| `որպես` | come, in qualità di | rank 120 |

**Proposta**: non aggiungerle allo strato attivo (i 100 slot sono chiusi), ma
inserirle nelle lezioni come lessico ricettivo, così da renderle utilizzabili
nei testi senza consumare slot SRS.

---

## 4. Il pronome personale ai casi obliqui — MEDIA

`ինձ`, `քեզ`, `նրան`, `մեզ`, `ձեզ`, `նրանց` compaiono sparsi nelle lezioni ma
non sono mai presentati come paradigma. Sono fra le forme più frequenti della
lingua (`նրան` è al rank 87). Coerente con la decisione già presa: vanno
nell'SRS come carte di grammatica, fuori dal conteggio delle 100.

---

## 5. Nota di metodo

Il filtro di frequenza sull'EANC dice cosa manca **rispetto al corpus**.
Non dice cosa manca **rispetto a ciò che serve per costruire un testo**.
Le lacune qui sopra sono emerse solo scrivendo: sono la prova che l'audit
lessicale e la produzione di materiale sono due controlli diversi e
complementari, e che nessuno dei due sostituisce l'altro.

---

## 6. Nota tecnica: la punteggiatura armena sta DENTRO la parola

Scoperto costruendo le letture. Tre segni si scrivono all'interno della parola,
non dopo:

| segno | nome | esempio |
|---|---|---|
| `՞` U+055E | interrogativo | `Ո՞վ`, `Ի՞նչ`, `Ե՞րբ` |
| `՛` U+055B | enfasi / imperativo | `Գնա՛`, `Եկե՛ք` |
| `՜` U+055C | esclamativo | `Ի՜նչ`, `Ափսո՜ս` |

Nel corpus attuale: 344 occorrenze intra-parola dell'interrogativo, 38 dell'enfasi,
9 dell'esclamativo. Invece `։` (punto fermo, 1387 occorrenze) e `՝` (virgola)
stanno **fuori** dalla parola e si comportano come in italiano.

**Conseguenza per gli strumenti**: qualunque tokenizzatore che consideri parola
una sequenza di sole lettere spezza `Ո՞վ` in `Ո` + `վ`. Il risultato è doppio:
la parola vera non viene riconosciuta, e due frammenti inesistenti entrano nel
vocabolario. Corretto in `tools/reading_validator.py` e `tools/vocab_at.py`
(costante `INTRAWORD`); `tools/lint_content.js` lo gestiva già.

---

## 7. Regole vs euristiche: il plurale (verificato sul corpus)

La regola «una sillaba → -եր, più di una → -ներ» è stata testata sui 423 nomi
più frequenti dell'EANC che hanno un plurale attestato (≥50 occorrenze).

| conteggio delle sillabe | regola rispettata |
|---|---|
| contando le **vocali scritte** | 89% |
| contando le **sillabe pronunciate** (con lo ə epentetico) | **97%** |

**Il problema non era la regola, era il conteggio.** In armeno un gruppo di due
consonanti iniziali sviluppa nel parlato una vocale breve ə che non si scrive:
`դպրոց` = դըպ-րոց, `տղա` = տը-ղա, `գրող` = գը-րող, `խնձոր` = խըն-ձոր.
Chi conta le vocali sulla pagina li giudica monosillabici e sbaglia il plurale
di otto parole comuni. Eccezione all'eccezione: se la seconda lettera è `յ`
non c'è nessuno ə (`գյուղ` = una sillaba → գյուղեր).

**Eccezioni vere** (monosillabi che prendono -ներ): `մատ` → մատներ,
`լեռ` → լեռներ, `ձեռ` → ձեռներ (ma `ձեռք` → ձեռքեր, regolare).

Applicato in `l022`: la nota parla di sillabe pronunciate, due passi `notice`
spiegano lo ə nascosto e le eccezioni, e la domanda finale non dice più
«regola generale» ma «nella grande maggioranza dei casi».

---

## 8. Articolo determinato davanti a vocale (verificato con madrelingua)

L'articolo `-ը` diventa `-ն` quando la parola **successiva** inizia per vocale.
Segnalato da un madrelingua su «Ես Դավիթ եմ։ Հիմա ես տանը եմ։», che conteneva
due violazioni nella stessa riga.

**Si applica** (corretti 96 casi in tutto il corpus):
- davanti alla copula: `Ես տանն եմ`, `Իմ տունն է` — la regola è obbligatoria;
- davanti a `ու`: `հայրն ու մայրը`;
- davanti a vocale in genere: `Արագածն ամենալավն է` (entrambe accettabili,
  ma questa è la forma preferita);
- **nomi propri come predicato**: `Ես Դավիթն եմ`, non `Ես Դավիթ եմ`.
  Se il nome finisce per vocale l'articolo è `-ն` comunque: `Ես Աննան եմ`.

**Non si applica**:
- `վաղը` — è un avverbio lessicalizzato, non un nome con articolo;
- davanti a numerale: `Ժամը երկուսն է`, `Օրը երկու անգամ`;
- davanti a `և`, che inizia per [j], consonante: `մայրը և հայրը`.

Controllo automatico in `tools/check_article.js`.
