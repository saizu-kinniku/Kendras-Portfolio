# Kendra Schlegel – Portfolio

Astro-Website + Sanity Studio (unter `/studio`), gehostet auf Netlify.

```
/            Astro-Website (statisch)
/studio      Sanity Studio – Kendra pflegt hier alle Inhalte
```

## Lokal entwickeln

```bash
npm install
npm run dev                   # Website: http://localhost:4321

# Studio lokal
npm --prefix studio install
npm run studio                # http://localhost:3333/studio
```

Sanity-Projekt: `kkd7bqq0`, Dataset `production` (fest eingetragen, per Umgebungsvariable überschreibbar).
Mit `SANITY_PROJECT_ID="" npm run dev` läuft die Website ohne Sanity, nur mit Platzhaltern.

## Inhalte (Sanity)

Das Studio ist aufgebaut wie die Website – Seiten in der Reihenfolge der Navigation, Felder in der Reihenfolge, in der sie auf der Seite erscheinen:

```
Startseite                 Hero-Bild, Introtext, Selected works
Illustration
  ├ Seite                  Header-Bild, PDF-Portfolio
  └ Projekte               sortierbar per Drag & Drop
Design
  ├ Seite                  Header-Bild, PDF-Portfolio
  └ Projekte
About & Contact            Porträt, Begrüssung, Einleitung, Text, Illustration beim Formular
Impressum (Legal Notice)   Name, Adresse, weitere Abschnitte
──────────
Auf allen Seiten
  ├ Kontakt-Block          gelber Block unten: Illustration, Titel
  └ Footer & Kontaktdaten  Untertitel, E-Mail, Instagram
```

- Projekte haben zwei Reiter: **Projektkarte** (Titel, Titelbild, Schlagworte) und **Projektseite** (Beschreibung, Bilder, Adresse).
- „Neues Projekt“ in einer Projektliste setzt den Bereich automatisch.
- Bilder: Fokuspunkt (Hotspot) setzen – danach richtet sich der Ausschnitt auf Desktop und Mobile.
- Leere Felder fallen auf Platzhalter zurück; fehlt ein PDF, werden die PDF-Buttons ausgeblendet.

## Einmalige Einrichtung

### 1. Sanity (sanity.io/manage → Projekt)
1. Project ID: `kkd7bqq0` · Dataset: `production` (muss existieren).
2. **API → CORS origins** → hinzufügen, jeweils mit „Allow credentials“:
   - `http://localhost:3333`
   - `https://<netlify-name>.netlify.app`
   - `https://<eigene-domain>` (sobald verbunden)

### 2. GitHub
Repository mit diesem Code (Kendra ist Owner, Luis Collaborator).

### 3. Netlify (Kendras Konto)
1. **Add new project → Import from Git** → Repository wählen. Build-Einstellungen kommen aus `netlify.toml`.
2. Umgebungsvariablen sind nicht nötig (Projekt-ID ist im Code).
3. **Build & deploy → Build hooks** → Hook „Sanity“ anlegen, URL kopieren.
4. **Forms** → Formularerkennung aktivieren; unter *Form notifications* E-Mail an Kendra einrichten.

### 4. Automatisch neu bauen, wenn Kendra veröffentlicht
sanity.io/manage → **API → Webhooks → Create webhook**
- URL: Build-Hook aus Schritt 3.3
- Dataset: `production`, Trigger: Create, Update, Delete
- HTTP-Methode: POST

Nach dem Veröffentlichen in Sanity ist die Änderung nach ca. 1–2 Minuten online.

### 5. Domain (Infomaniak)
Netlify → **Domain management → Add domain** → DNS-Einträge bei Infomaniak setzen, wie Netlify sie anzeigt. Die Mail-Einträge (MX) bei Infomaniak bleiben unverändert.

## Struktur

| Figma-Screen | Datei |
|---|---|
| Landing Page | `src/pages/index.astro` |
| Portfolio Overview | `src/components/CategoryOverview.astro` (`/illustration/`, `/design/`) |
| Project | `src/pages/projects/[slug].astro` |
| About & Contact | `src/pages/about.astro` |
| – | `src/pages/legal-notice.astro` |

- Komponenten: `src/components/` (Nav mit Burger-Menü, Footer, CTA, Button, NavLink, ArrowLink, ProjectCard, Img)
- Design-Tokens: `src/styles/global.css` (fluid, ab ~1566px exakt Figma)
- Sanity-Abfragen: `src/lib/content.ts`
- Sanity-Schemas: `studio/schemaTypes/`

Breakpoints: Tablet ≤ 1100px · Burger-Menü ≤ 960px · Mobile ≤ 700px

## Offen vor dem Launch

- Datenschutzerklärung (Kontaktformular)
- Favicon
