# Lenval Properties

Sito web istituzionale per Lenval Properties, sviluppato con Next.js utilizzando la repository https://github.com/morluto/rea per fare il reverse engeneering del sito di ispirazione . Il progetto presenta il brand e i suoi sviluppi immobiliari ad Abu Dhabi, con animazioni, video e contenuti 3D interattivi.

## Requisiti

- Node.js 20 o superiore
- npm

## Avvio in locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## Comandi disponibili

```bash
npm run dev    # Avvia il server di sviluppo
npm run build  # Crea la build di produzione
npm run start  # Avvia la build di produzione
```

## Tecnologie

- Next.js 15 e React 19
- TypeScript e Tailwind CSS
- GSAP e Lenis per le animazioni e lo scorrimento
- Three.js per le scene 3D

## Struttura

- `src/app/`: pagina principale, layout e stili globali
- `src/components/`: componenti dell'interfaccia e animazioni
- `src/hooks/`: hook per lo scorrimento e le animazioni
- `public/`: immagini, font, video e risorse 3D
