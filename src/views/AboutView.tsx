import { ExternalLink, Info } from 'lucide-react'
import { aboutFields, aboutMeta } from '../config/about'

export function AboutView() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
        <Info size={18} style={{ color: 'var(--app-accent)' }} />
        About
      </h2>

      <section
        className="max-w-lg rounded-lg border p-5"
        style={{ borderColor: 'var(--app-border)', background: 'var(--app-panel)' }}
      >
        <h3 className="text-lg font-bold">{aboutMeta.appName}</h3>
        <p className="text-sm" style={{ color: 'var(--app-accent)' }}>
          Version {aboutMeta.version}
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--app-text-muted)' }}>
          {aboutMeta.tagline}
        </p>

        <dl className="mt-6 space-y-3 border-t pt-4" style={{ borderColor: 'var(--app-border)' }}>
          {aboutFields.map((field) => (
            <div key={field.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <dt
                className="shrink-0 text-xs font-semibold uppercase tracking-wide sm:w-28"
                style={{ color: 'var(--app-text-muted)' }}
              >
                {field.label}
              </dt>
              <dd className="text-sm">
                {field.href ? (
                  <a
                    href={field.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                    style={{ color: 'var(--app-accent)' }}
                  >
                    {field.value ?? field.href}
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  field.value ?? '—'
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
