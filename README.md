# Kendra Schlegel – Portfolio

Astro-Website (https://kendraschlegel.com), Inhalte als Dateien im Repo, bearbeitet mit **Pages CMS**, gehostet auf **Cloudflare Pages**.

```
src/content/pages/*.json        Startseite, Übersichtsseiten, About, Impressum, Kontakt-Block, Footer
src/content/illustration/*.md   Projekte Illustration
src/content/design/*.md         Projekte Design
src/assets/uploads/             hochgeladene Bilder (werden beim Build optimiert, WebP + srcset)
public/files/                   hochgeladene PDFs
.pages.yml                      Konfiguration von Pages CMS
```

## Inhalte bearbeiten (Kendra)

1. https://app.pagescms.org öffnen, mit GitHub anmelden
2. Repository **Kendras-Portfolio** wählen
3. Bearbeiten und **Save** – die Website ist nach ca. 1–2 Minuten aktualisiert

Aufbau im CMS (wie die Website):

```
Startseite                 Hero-Bild, Bildausschnitt, Introtext
Illustration
  ├ Seite                  Header-Bild, PDF-Portfolio
  └ Projekte               Titel, Titelbild, Schlagworte, „Auf der Startseite zeigen“, Reihenfolge, Beschreibung, Bilder
Design
  ├ Seite
  └ Projekte
About & Contact            Porträt, Begrüssung, Einleitung, Text, Illustration beim Formular
Impressum (Legal Notice)   Name, Adresse, weitere Abschnitte
Auf allen Seiten
  ├ Kontakt-Block          Illustration, Titel
  └ Footer & Kontaktdaten  Untertitel, E-Mail, Instagram
```

**Bilder vor dem Hochladen verkleinern:** ca. 3000 px lange Kante, 1–2 MB. Die Website erzeugt daraus selbst alle nötigen Grössen; zu grosse Originale machen nur das Repository schwer.

## Kontaktformular

Kein Server: „Send“ öffnet das Mailprogramm der Besucherin mit Empfängerin (E-Mail aus „Footer & Kontaktdaten“), Betreff und Nachricht. Darunter steht die Adresse zum Kopieren, falls sich kein Mailprogramm öffnet.

## Lokal entwickeln

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # statischer Build nach dist/
```

## Einrichtung Cloudflare Pages (einmalig)

1. Cloudflare-Konto anlegen → **Workers & Pages → Create → Pages → Connect to Git**
2. GitHub verbinden, Repository **Kendras-Portfolio** wählen
3. Build-Einstellungen:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. **Save and Deploy**
5. Domain: `kendraschlegel.com` (Nameserver bei Strato → Cloudflare), unter **Custom domains** mit und ohne www verbunden. Die Adresse steht in `astro.config.mjs` (`site`).

Node-Version kommt aus `.node-version`.

## Struktur

| Figma-Screen | Datei |
|---|---|
| Landing Page | `src/pages/index.astro` |
| Portfolio Overview | `src/pages/[category]/index.astro` → `src/components/CategoryOverview.astro` |
| Project | `src/pages/[category]/[slug].astro` (URL: `/illustration/<projekt>/`) |
| About & Contact | `src/pages/about.astro` |
| – | `src/pages/legal-notice.astro`, `src/pages/404.astro` |

- Komponenten: `src/components/`
- Design-Tokens: `src/styles/global.css` (fluid, ab ~1566px exakt Figma)
- Inhalte laden + Bilder optimieren: `src/lib/content.ts`

Breakpoints: Tablet ≤ 1100px · Burger-Menü ≤ 960px · Mobile ≤ 700px

## Offen vor dem Launch

- Datenschutzerklärung
- Favicon
