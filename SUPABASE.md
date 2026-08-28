# Attivare gli account

Finché `src/supabase.js` ha i due campi vuoti, Ora funziona come sempre: tutto in locale, nessun
account, nessuna rete. Questi passaggi accendono la registrazione e la sincronizzazione.

Servono una decina di minuti, una volta sola. Il piano gratuito di Supabase regge tranquillamente
decine di persone che usano un'app come questa.

## 1. Crea il progetto

1. Vai su [supabase.com](https://supabase.com) → **New project**.
2. Chiamalo `ora`, scegli una password per il database (serve solo a te, mettila da parte) e
   una regione europea.
3. Aspetta un paio di minuti che finisca di crearsi.

## 2. Crea la tabella e le regole

Apri **SQL Editor** nel menù a sinistra, incolla tutto questo e premi **Run**.

È la parte che conta davvero: le policy fanno sì che ogni persona possa leggere e scrivere
soltanto la propria riga. Senza, i dati sarebbero leggibili da chiunque abbia la chiave.

```sql
-- Una riga per persona: tutto il suo stato in un campo JSON.
create table if not exists public.ora_state (
  user_id    uuid primary key references auth.users on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ora_state enable row level security;

-- Ognuna vede e tocca solo la propria riga.
create policy "legge la sua"    on public.ora_state for select using  (auth.uid() = user_id);
create policy "crea la sua"     on public.ora_state for insert with check (auth.uid() = user_id);
create policy "aggiorna la sua" on public.ora_state for update using  (auth.uid() = user_id)
                                                          with check (auth.uid() = user_id);
create policy "cancella la sua" on public.ora_state for delete using  (auth.uid() = user_id);

-- Permette a una persona di eliminare davvero il proprio account dall'app.
create or replace function public.delete_me()
returns void
language sql
security definer
set search_path = public
as $$ delete from auth.users where id = auth.uid(); $$;

revoke all on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;
```

## 3. Sistema l'accesso via email

**Authentication → Sign In / Providers**: **Email** dev'essere attivo (lo è di default).

Poi decidi una cosa, in **Authentication → Sign In / Providers → Email**:

- **"Confirm email" acceso** (predefinito): chi si iscrive riceve una mail e deve cliccare il link
  prima di poter entrare. Più sicuro, ma con il servizio mail di default di Supabase le mail sono
  limitate a poche all'ora — va bene per pochi amici, non per un lancio.
- **Spento**: si entra subito dopo la registrazione. Più semplice da condividere. L'app gestisce
  bene entrambi i casi: se serve la conferma lo dice, invece di lasciarti davanti a una schermata
  ferma.

In **Authentication → URL Configuration** aggiungi `https://costifirri.github.io/ora/` fra i
**Redirect URLs**: serve al link per rifare la password.

## 4. Copia i due valori nell'app

**Project Settings → API**: copia **Project URL** e la chiave **anon public** dentro
`src/supabase.js`. Poi `npm run deploy`.

Alla prossima apertura l'app chiede di entrare o creare uno spazio.

## Cosa sincronizza e cosa no

| Cosa | Dove vive |
| --- | --- |
| Check-in, inneschi, corpo, legami, percorso, diario, pensieri, memoria, chat | Nel tuo spazio: ti segue su ogni dispositivo, leggibile solo dal tuo account |
| **Chiave API di Ora** | **Solo sul dispositivo dove la incolli**, e se ne va quando esci |

La chiave resta fuori di proposito: è una credenziale che comporta addebiti, e un database
compromesso significherebbe chiavi rubate. Ognuna la inserisce una volta per telefono
(`src/cloud.js` → `withoutSecrets`, `src/storage.js` → cassetto `ora-apikey`).

## Cosa vede chi si iscrive

La schermata d'accesso. Creando uno spazio le viene chiesto **il suo nome** (niente è precompilato
con il tuo), parte con una lista di persone generica per ruolo — compagno, famiglia, lavoro,
un'amicizia — da rinominare come vuole, e trova il campo per **la sua chiave API** nel profilo,
con le istruzioni per generarla.

## Al primo accesso

Se apri l'app su un dispositivo dove avevi già dei dati locali e crei il tuo spazio, quei dati
vengono portati su. Se invece lo spazio esiste già, vince quello che c'è nel cloud.

## Costi

Il piano gratuito di Supabase include 50.000 utenti attivi al mese e mezzo giga di database: per
un'app come questa, che scrive poche decine di volte al giorno a persona, è abbondante. L'unico
limite da tenere d'occhio è l'invio delle email di conferma, se la lasci accesa.

Nota: i progetti gratuiti vanno **in pausa dopo una settimana senza attività**. Se succede, si
riattivano dalla dashboard in un minuto.
