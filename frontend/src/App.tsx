import { FormEvent, useEffect, useState } from 'react'
import { api, Dashboard, Grant, Me, Organization, SavedGrant } from './api'

type AuthMode = 'login' | 'signup'

const emptyOrganization: Organization = {
  id: '', name: '', description: '', organization_type: '', regions: '', focus_areas: '',
  annual_budget_cents: null, team_size: null, updated_at: '',
}

function App() {
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.me().then(setMe).catch(() => undefined).finally(() => setLoading(false))
  }, [])

  if (loading) return <main className="loading-shell">Loading your workspace...</main>
  if (!me) return <AuthScreen onAuthenticated={setMe} />

  return <Workspace me={me} onAuthenticated={setMe} onError={setError} error={error} />
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (me: Me) => void }) {
  const [mode, setMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = mode === 'signup'
        ? await api.signup({ email, password, organization_name: organizationName })
        : await api.login({ email, password })
      onAuthenticated(result)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to continue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-intro">
        <p className="eyebrow">GRANTBRIDGE / 01</p>
        <h1>Turn scattered grant leads into a plan.</h1>
        <p className="intro-copy">A calm workspace for small organizations to discover relevant funding and keep deadlines visible.</p>
        <div className="signal-list">
          <span><strong>01</strong> Build a clear organization profile</span>
          <span><strong>02</strong> Match opportunities with evidence</span>
          <span><strong>03</strong> Keep the next deadline in view</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="mode-switch" role="tablist" aria-label="Account mode">
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button>
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button>
        </div>
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h2>{mode === 'signup' ? 'Start with your organization.' : 'Welcome back.'}</h2>
        <p className="muted">{mode === 'signup' ? 'Set up a profile so grant matches have useful context.' : 'Continue building your funding pipeline.'}</p>
        <form onSubmit={submit}>
          {mode === 'signup' && <label>Organization name<input required minLength={2} value={organizationName} onChange={event => setOrganizationName(event.target.value)} placeholder="Harbor Community Network" /></label>}
          <label>Email address<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.org" /></label>
          <label>Password<input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="primary-button" disabled={submitting}>{submitting ? 'Opening workspace...' : mode === 'signup' ? 'Create workspace' : 'Sign in'}</button>
        </form>
        <p className="fine-print">Your profile stays private to your organization account.</p>
      </section>
    </main>
  )
}

function Workspace({ me, onAuthenticated, onError, error }: { me: Me; onAuthenticated: (me: Me) => void; onError: (error: string) => void; error: string }) {
  const [view, setView] = useState<'profile' | 'catalogue' | 'pipeline'>('catalogue')
  const [organization, setOrganization] = useState(me.organization)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true); setSaved(false); onError('')
    try {
      const updated = await api.updateOrganization({ ...organization, annual_budget_cents: organization.annual_budget_cents || null, team_size: organization.team_size || null })
      setOrganization(updated); onAuthenticated({ ...me, organization: updated }); setSaved(true)
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : 'Unable to save profile')
    } finally { setSaving(false) }
  }

  async function logout() {
    await api.logout(); window.location.reload()
  }

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand-mark"><span className="brand-dot" />GrantBridge</div><div className="topbar-user"><span>{me.user.email}</span><button className="quiet-button" onClick={logout}>Sign out</button></div></header>
      <div className="workspace-grid">
        <aside className="side-rail"><p className="eyebrow">WORKSPACE</p><nav><button className={`nav-item ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')}><span>01</span> Organization profile</button><button className={`nav-item ${view === 'catalogue' ? 'active' : ''}`} onClick={() => setView('catalogue')}><span>02</span> Grant catalogue</button><button className={`nav-item ${view === 'pipeline' ? 'active' : ''}`} onClick={() => setView('pipeline')}><span>03</span> Funding pipeline</button></nav><div className="rail-note"><span className="status-dot" />Milestone 3 active<br /><small>Turn leads into decisions.</small></div></aside>
        <section className="content-area">{view === 'catalogue' ? <GrantCatalogue onSaved={() => setView('pipeline')} /> : view === 'pipeline' ? <Pipeline /> : <ProfilePanel organization={organization} setOrganization={setOrganization} save={save} saving={saving} saved={saved} error={error} />}</section></div>
    </main>
  )
}

function ProfilePanel({ organization, setOrganization, save, saving, saved, error }: { organization: Organization; setOrganization: (organization: Organization) => void; save: (event: FormEvent) => void; saving: boolean; saved: boolean; error: string }) {
  return <><div className="content-heading"><div><p className="eyebrow">01 / ORGANIZATION PROFILE</p><h1>Give your mission a clear shape.</h1><p className="muted">This information powers relevant grant matches.</p></div><div className="completion"><strong>{profileCompletion(organization)}%</strong><span>profile ready</span></div></div><form className="profile-form" onSubmit={save}><div className="form-section"><div className="section-label">Identity</div><div className="form-fields"><label>Organization name<input required value={organization.name} onChange={event => setOrganization({ ...organization, name: event.target.value })} /></label><label>Organization type<input value={organization.organization_type} onChange={event => setOrganization({ ...organization, organization_type: event.target.value })} placeholder="Nonprofit, community group..." /></label></div><label>Mission statement<textarea value={organization.description} onChange={event => setOrganization({ ...organization, description: event.target.value })} placeholder="What change does your organization work toward?" rows={4} /></label></div><div className="form-section"><div className="section-label">Funding context</div><div className="form-fields"><label>Regions served<input value={organization.regions} onChange={event => setOrganization({ ...organization, regions: event.target.value })} placeholder="Colombo, Western Province" /></label><label>Focus areas<input value={organization.focus_areas} onChange={event => setOrganization({ ...organization, focus_areas: event.target.value })} placeholder="Housing, food access, education" /></label><label>Annual budget (USD)<input type="number" min="0" value={organization.annual_budget_cents ? organization.annual_budget_cents / 100 : ''} onChange={event => setOrganization({ ...organization, annual_budget_cents: event.target.value ? Math.round(Number(event.target.value) * 100) : null })} placeholder="25000" /></label><label>Team size<input type="number" min="1" value={organization.team_size ?? ''} onChange={event => setOrganization({ ...organization, team_size: event.target.value ? Number(event.target.value) : null })} placeholder="4" /></label></div></div><div className="form-actions">{error && <p className="error" role="alert">{error}</p>}{saved && <p className="success" role="status">Profile saved.</p>}<button className="primary-button" disabled={saving}>{saving ? 'Saving profile...' : 'Save profile'}</button></div></form></>
}

function GrantCatalogue({ onSaved }: { onSaved: () => void }) {
  const [grants, setGrants] = useState<Grant[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [focusArea, setFocusArea] = useState('')
  const [region, setRegion] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pageSize = 6

  useEffect(() => {
    setLoading(true); setError('')
    api.grants({ search, focus_area: focusArea, region, page, page_size: pageSize })
      .then(result => { setGrants(result.items); setTotal(result.total) })
      .catch(caught => setError(caught instanceof Error ? caught.message : 'Unable to load grants'))
      .finally(() => setLoading(false))
  }, [search, focusArea, region, page])

  function resetFilters() { setSearch(''); setFocusArea(''); setRegion(''); setPage(1) }
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  return <div className="catalogue"><div className="content-heading catalogue-heading"><div><p className="eyebrow">02 / GRANT CATALOGUE</p><h1>Find the right next lead.</h1><p className="muted">Curated public opportunities with source links and verification dates.</p></div><div className="catalogue-count"><strong>{total}</strong><span>opportunities</span></div></div><div className="grant-filters"><label>Search<input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder="Search title, funder, mission..." /></label><label>Focus area<input value={focusArea} onChange={event => { setFocusArea(event.target.value); setPage(1) }} placeholder="housing, education..." /></label><label>Region<input value={region} onChange={event => { setRegion(event.target.value); setPage(1) }} placeholder="Colombo, National..." /></label><button className="quiet-button" onClick={resetFilters}>Clear</button></div>{error && <p className="error" role="alert">{error}</p>}{loading ? <div className="catalogue-empty">Loading opportunities...</div> : grants.length === 0 ? <div className="catalogue-empty"><strong>No opportunities match those filters.</strong><button className="quiet-button" onClick={resetFilters}>Reset filters</button></div> : <div className="grant-grid">{grants.map(grant => <GrantCard key={grant.id} grant={grant} onSaved={onSaved} />)}</div>}<div className="pagination"><span>Page {page} of {pageCount}</span><div><button className="quiet-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="quiet-button" disabled={page >= pageCount} onClick={() => setPage(page + 1)}>Next</button></div></div></div>
}

function GrantCard({ grant, onSaved }: { grant: Grant; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(grant.is_saved)
  const deadline = grant.deadline ? new Date(grant.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline listed'
  const amount = grant.amount_max_cents ? `$${(grant.amount_max_cents / 100).toLocaleString()} max` : 'Amount varies'
  async function save() { setSaving(true); await api.saveGrant(grant.id); setSaved(true); setSaving(false); onSaved() }
  return <article className="grant-card"><div className="grant-card-top"><span className="source-badge">{grant.source_type === 'curated_seed' ? 'CURATED' : 'PUBLIC SOURCE'}</span><span className="deadline">{deadline}</span></div><div className="match-line"><strong>{grant.match_score ?? 0}% match</strong><span>{grant.match_reasons[0] ?? 'Complete your profile for a sharper match'}</span></div><h2>{grant.title}</h2><p className="grant-funder">{grant.funder}</p><p className="grant-summary">{grant.summary}</p><div className="tag-row">{grant.focus_areas.slice(0, 3).map(area => <span key={area}>{area}</span>)}</div><div className="grant-card-meta"><span><small>Potential award</small>{amount}</span><span><small>Eligibility</small>{grant.applicant_types.slice(0, 2).join(', ')}</span></div><div className="grant-card-footer"><small>Verified {new Date(grant.last_verified_at).toLocaleDateString()}</small><div className="card-actions"><a href={grant.application_url} target="_blank" rel="noreferrer">Official source ↗</a><button className="save-button" disabled={saving || saved} onClick={save}>{saved ? 'Saved' : saving ? 'Saving...' : 'Save lead'}</button></div></div></article>
}

function Pipeline() {
  const [items, setItems] = useState<SavedGrant[]>([])
  const [summary, setSummary] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reporting, setReporting] = useState(false)
  async function load() { setLoading(true); try { const [saved, dashboard] = await Promise.all([api.savedGrants(), api.dashboard()]); setItems(saved); setSummary(dashboard) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to load pipeline') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  async function update(item: SavedGrant, status: string, notes: string) { await api.updateSavedGrant(item.id, { status, notes, follow_up_at: item.follow_up_at }); await load() }
  async function remove(id: string) { await api.deleteSavedGrant(id); await load() }
  async function generateReport() { setReporting(true); try { const blob = await api.pipelineReport(); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'grantbridge-pipeline.pdf'; anchor.click(); URL.revokeObjectURL(url); setNotice('PDF report downloaded.') } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to generate report') } finally { setReporting(false) } }
  async function runReminders() { const result = await api.runReminders(); setNotice(result.created ? `${result.created} reminder created.` : 'No new reminders are due.') }
  return <div className="pipeline"><div className="content-heading"><div><p className="eyebrow">03 / FUNDING PIPELINE</p><h1>Keep the next move visible.</h1><p className="muted">Your saved opportunities, current status, and upcoming deadlines in one place.</p></div><div className="pipeline-actions"><button className="quiet-button" onClick={runReminders}>Check reminders</button><button className="primary-button compact-button" disabled={reporting} onClick={generateReport}>{reporting ? 'Generating...' : 'Download PDF'}</button></div></div>{summary && <div className="summary-grid"><div><strong>{summary.saved_count}</strong><span>saved leads</span></div><div><strong>{summary.active_count}</strong><span>active reviews</span></div><div><strong>{summary.applied_count}</strong><span>applications</span></div><div><strong>${(summary.pipeline_amount_cents / 100).toLocaleString()}</strong><span>pipeline ceiling</span></div></div>}{notice && <p className="success" role="status">{notice}</p>}{error && <p className="error">{error}</p>}{loading ? <div className="catalogue-empty">Loading pipeline...</div> : items.length === 0 ? <div className="catalogue-empty"><strong>Your pipeline is empty.</strong><span>Save a lead from the catalogue to start tracking it.</span></div> : <div className="pipeline-list">{items.map(item => <PipelineRow key={item.id} item={item} onUpdate={update} onDelete={remove} />)}</div>}</div>
}

function PipelineRow({ item, onUpdate, onDelete }: { item: SavedGrant; onUpdate: (item: SavedGrant, status: string, notes: string) => void; onDelete: (id: string) => void }) {
  const [notes, setNotes] = useState(item.notes)
  const [explanation, setExplanation] = useState('')
  const [explaining, setExplaining] = useState(false)
  async function explain() { setExplaining(true); try { setExplanation((await api.explanation(item.grant.id)).explanation) } finally { setExplaining(false) } }
  return <article className="pipeline-row"><div><span className="source-badge">{item.status.toUpperCase()}</span><h2>{item.grant.title}</h2><p className="grant-funder">{item.grant.funder} · Deadline {item.grant.deadline ? new Date(item.grant.deadline).toLocaleDateString() : 'not listed'}</p><p className="pipeline-reason">{item.grant.match_score}% match · {item.grant.match_reasons.join(' · ') || 'Review eligibility details'}</p>{explanation && <p className="explanation">{explanation}</p>}</div><div className="pipeline-controls"><label>Status<select value={item.status} onChange={event => onUpdate(item, event.target.value, notes)}><option value="saved">Saved</option><option value="reviewing">Reviewing</option><option value="applied">Applied</option><option value="rejected">Rejected</option><option value="won">Won</option><option value="archived">Archived</option></select></label><label>Notes<textarea value={notes} onChange={event => setNotes(event.target.value)} onBlur={() => onUpdate(item, item.status, notes)} placeholder="Next action or context..." rows={2} /></label><div className="pipeline-row-actions"><button className="quiet-button" onClick={explain}>{explaining ? 'Thinking...' : 'Explain fit'}</button><button className="quiet-button" onClick={() => onDelete(item.id)}>Remove</button></div></div></article>
}

function profileCompletion(organization: Organization) {
  const fields = [organization.name, organization.description, organization.organization_type, organization.regions, organization.focus_areas, organization.annual_budget_cents, organization.team_size]
  return Math.round(fields.filter(Boolean).length / fields.length * 100)
}

export default App
