import {useState} from 'react'
import {useClient, type DocumentActionComponent} from 'sanity'
import {RocketIcon} from '@sanity/icons/Rocket'

/**
 * „Alles veröffentlichen & Website aktualisieren“
 *
 * 1. Veröffentlicht alle offenen Entwürfe in einem Schritt.
 * 2. Speichert einen Zeitstempel im Dokument „deploy“ – nur DAS löst (über den
 *    Sanity-Webhook mit Filter `_type == "deployTrigger"`) einen Netlify-Build aus.
 *
 * So kostet eine ganze Runde Änderungen nur einen Deploy.
 */
export const publishAllAction: DocumentActionComponent = (props) => {
  // "raw", damit Entwürfe (drafts.*) mitgelesen werden
  const client = useClient({apiVersion: '2026-11-01'}).withConfig({perspective: 'raw'})
  const [dialog, setDialog] = useState<null | 'confirm' | 'done' | 'error'>(null)
  const [drafts, setDrafts] = useState<{_id: string; _type: string; title?: string}[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const typeLabels: Record<string, string> = {
    project: 'Projekt',
    home: 'Startseite',
    categoryPage: 'Übersichtsseite',
    about: 'About & Contact',
    legal: 'Impressum',
    ctaBlock: 'Kontakt-Block',
    settings: 'Footer & Kontaktdaten',
  }

  const run = async () => {
    setBusy(true)
    try {
      // Alle Entwürfe (ausser diesem Dokument) vollständig laden
      const all = await client.fetch<Record<string, unknown>[]>(
        `*[_id in path("drafts.**") && _type != "deployTrigger"]`,
      )
      const tx = client.transaction()
      for (const draft of all) {
        const {_rev, _updatedAt, ...doc} = draft as {_id: string; _rev?: string; _updatedAt?: string}
        void _rev
        void _updatedAt
        const publishedId = doc._id.replace(/^drafts\./, '')
        tx.createOrReplace({...(doc as Record<string, unknown>), _id: publishedId} as never)
        tx.delete(doc._id)
      }
      // Zeitstempel → Webhook → Netlify-Build
      tx.createOrReplace({
        _id: 'deploy',
        _type: 'deployTrigger',
        requestedAt: new Date().toISOString(),
        publishedCount: all.length,
      })
      tx.delete('drafts.deploy')
      await tx.commit()
      setDialog('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setDialog('error')
    } finally {
      setBusy(false)
    }
  }

  const open = async () => {
    const list = await client.fetch<{_id: string; _type: string; title?: string}[]>(
      `*[_id in path("drafts.**") && _type != "deployTrigger"]{_id, _type, title}`,
    )
    setDrafts(list)
    setDialog('confirm')
  }

  const draftList = drafts.length
    ? drafts
        .map((d) => `• ${typeLabels[d._type] ?? d._type}${d.title ? `: ${d.title}` : ''}`)
        .join('\n')
    : 'Keine offenen Entwürfe – die Website wird mit dem aktuellen Stand neu gebaut.'

  return {
    label: busy ? 'Wird veröffentlicht …' : 'Alles veröffentlichen & Website aktualisieren',
    icon: RocketIcon,
    tone: 'positive',
    disabled: busy,
    onHandle: open,
    dialog:
      dialog === 'confirm'
        ? {
            type: 'confirm',
            tone: 'positive',
            message: (
              <div style={{whiteSpace: 'pre-line'}}>
                {drafts.length
                  ? `${drafts.length} ${drafts.length === 1 ? 'Änderung wird' : 'Änderungen werden'} veröffentlicht:\n\n${draftList}\n\nDanach wird die Website neu gebaut (ca. 2 Minuten).`
                  : draftList}
              </div>
            ),
            onConfirm: () => {
              setDialog(null)
              run()
            },
            onCancel: () => setDialog(null),
          }
        : dialog === 'done'
          ? {
              type: 'dialog',
              header: 'Erledigt',
              content: 'Alles ist veröffentlicht. Die Website ist in etwa 2 Minuten aktualisiert.',
              onClose: () => {
                setDialog(null)
                props.onComplete()
              },
            }
          : dialog === 'error'
            ? {
                type: 'dialog',
                header: 'Das hat nicht geklappt',
                content: `Fehler: ${error}`,
                onClose: () => setDialog(null),
              }
            : null,
  }
}
