# Kendra Schlegel – Portfolio

Astro-Website + Sanity Studio (unter `/studio`), gehostet auf Netlify.

```
/            Astro-Website (statisch)
/studio      Sanity Studio – Kendra pflegt hier alle Inhalte
```

## Lokal entwickeln

```bash
npm install
cp .env.example .env          # SANITY_PROJECT_ID eintragen
npm run dev                   # Website: http://localhost:4321

# Studio lokal
echo "SANITY_STUDIO_PROJECT_ID=<id>" > studio/.env
npm --prefix studio install
npm run studio                # http://localhost:3333/studio
```

Ohne `SANITY_PROJECT_ID` läuft die Website mit Platzhaltern.

## Inhalte (Sanity)

| Im Studio | Wo auf der Website |
|---|---|
| **Illustration / Design** – Projekte, per Drag & Drop sortierbar | Übersichtsseiten, Projektseiten |
| **Startseite** – Hero-Bild, Introtext, „Selected works“ | Startseite |
| **About & Contact** – Porträt, Texte, Illustration beim Formular | About-Seite |
| **Impressum** – Name, Adresse, weitere Angaben | Legal Notice |
| **Allgemein** – Mail, Instagram, PDFs, Header-Bilder, Kontakt-Block | überall |

Bilder: Fokuspunkt (Hotspot) setzen – danach richtet sich der Bildausschnitt auf Desktop und Mobile.
Leere Felder fallen auf die Platzhalter in `src/data/projects.ts` zurück.

## Einmalige Einrichtung

### 1. Sanity (sanity.io/manage → Projekt)
1. **Project ID** notieren (Dataset: `production`).
2. **Members** → Luis als Administrator einladen.
3. **API → CORS origins** → hinzufügen, jeweils mit „Allow credentials“:
   - `http://localhost:3333`
   - `https://<netlify-name>.netlify.app`
   - `https://<eigene-domain>` (sobald verbunden)

### 2. GitHub
Repository mit diesem Code (Kendra ist Owner, Luis Collaborator).

### 3. Netlify (Kendras Konto)
1. **Add new project → Import from Git** → Repository wählen. Build-Einstellungen kommen aus `netlify.toml`.
2. **Project configuration → Environment variables**:
   - `SANITY_PROJECT_ID` = Project ID aus Schritt 1
   - `SANITY_DATASET` = `production`
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
- Favicon, Social-Vorschaubild, Sitemap, 404-Seite, Danke-Seite fürs Formular
