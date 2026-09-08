import { FormEvent, useEffect, useState } from 'react'
import { api, Grant, Me, Organization } from './api'

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
  const [view, setView] = useState<'profile' | 'catalogue'>('catalogue')
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
        <aside className="side-rail"><p className="eyebrow">WORKSPACE</p><nav><button className={`nav-item ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')}><span>01</span> Organization profile</button><button className={`nav-item ${view === 'catalogue' ? 'active' : ''}`} onClick={() => setView('catalogue')}><span>02</span> Grant catalogue</button><a className="nav-item disabled" href="#coming-soon"><span>03</span> Funding pipeline <em>soon</em></a></nav><div className="rail-note"><span className="status-dot" />Milestone 2 active<br /><small>Public opportunities are ready.</small></div></aside>
        <section className="content-area">{view === 'catalogue' ? <GrantCatalogue /> : <ProfilePanel organization={organization} setOrganization={setOrganization} save={save} saving={saving} saved={saved} error={error} />}</section></div>
    </main>
  )
}

function ProfilePanel({ organization, setOrganization, save, saving, saved, error }: { organization: Organization; setOrganization: (organization: Organization) => void; save: (event: FormEvent) => void; saving: boolean; saved: boolean; error: string }) {
  return <><div className="content-heading"><div><p className="eyebrow">01 / ORGANIZATION PROFILE</p><h1>Give your mission a clear shape.</h1><p className="muted">This information powers relevant grant matches.</p></div><div className="completion"><strong>{profileCompletion(organization)}%</strong><span>profile ready</span></div></div><form className="profile-form" onSubmit={save}><div className="form-section"><div className="section-label">Identity</div><div className="form-fields"><label>Organization name<input required value={organization.name} onChange={event => setOrganization({ ...organization, name: event.target.value })} /></label><label>Organization type<input value={organization.organization_type} onChange={event => setOrganization({ ...organization, organization_type: event.target.value })} placeholder="Nonprofit, community group..." /></label></div><label>Mission statement<textarea value={organization.description} onChange={event => setOrganization({ ...organization, description: event.target.value })} placeholder="What change does your organization work toward?" rows={4} /></label></div><div className="form-section"><div className="section-label">Funding context</div><div className="form-fields"><label>Regions served<input value={organization.regions} onChange={event => setOrganization({ ...organization, regions: event.target.value })} placeholder="Colombo, Western Province" /></label><label>Focus areas<input value={organization.focus_areas} onChange={event => setOrganization({ ...organization, focus_areas: event.target.value })} placeholder="Housing, food access, education" /></label><label>Annual budget (USD)<input type="number" min="0" value={organization.annual_budget_cents ? organization.annual_budget_cents / 100 : ''} onChange={event => setOrganization({ ...organization, annual_budget_cents: event.target.value ? Math.round(Number(event.target.value) * 100) : null })} placeholder="25000" /></label><label>Team size<input type="number" min="1" value={organization.team_size ?? ''} onChange={event => setOrganization({ ...organization, team_size: event.target.value ? Number(event.target.value) : null })} placeholder="4" /></label></div></div><div className="form-actions">{error && <p className="error" role="alert">{error}</p>}{saved && <p className="success" role="status">Profile saved.</p>}<button className="primary-button" disabled={saving}>{saving ? 'Saving profile...' : 'Save profile'}</button></div></form></>
}

function GrantCatalogue() {
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

  return <div className="catalogue"><div className="content-heading catalogue-heading"><div><p className="eyebrow">02 / GRANT CATALOGUE</p><h1>Find the right next lead.</h1><p className="muted">Curated public opportunities with source links and verification dates.</p></div><div className="catalogue-count"><strong>{total}</strong><span>opportunities</span></div></div><div className="grant-filters"><label>Search<input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder="Search title, funder, mission..." /></label><label>Focus area<input value={focusArea} onChange={event => { setFocusArea(event.target.value); setPage(1) }} placeholder="housing, education..." /></label><label>Region<input value={region} onChange={event => { setRegion(event.target.value); setPage(1) }} placeholder="Colombo, National..." /></label><button className="quiet-button" onClick={resetFilters}>Clear</button></div>{error && <p className="error" role="alert">{error}</p>}{loading ? <div className="catalogue-empty">Loading opportunities...</div> : grants.length === 0 ? <div className="catalogue-empty"><strong>No opportunities match those filters.</strong><button className="quiet-button" onClick={resetFilters}>Reset filters</button></div> : <div className="grant-grid">{grants.map(grant => <GrantCard key={grant.id} grant={grant} />)}</div>}<div className="pagination"><span>Page {page} of {pageCount}</span><div><button className="quiet-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="quiet-button" disabled={page >= pageCount} onClick={() => setPage(page + 1)}>Next</button></div></div></div>
}

function GrantCard({ grant }: { grant: Grant }) {
  const deadline = grant.deadline ? new Date(grant.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline listed'
  const amount = grant.amount_max_cents ? `$${(grant.amount_max_cents / 100).toLocaleString()} max` : 'Amount varies'
  return <article className="grant-card"><div className="grant-card-top"><span className="source-badge">{grant.source_type === 'curated_seed' ? 'CURATED' : 'PUBLIC SOURCE'}</span><span className="deadline">{deadline}</span></div><h2>{grant.title}</h2><p className="grant-funder">{grant.funder}</p><p className="grant-summary">{grant.summary}</p><div className="tag-row">{grant.focus_areas.slice(0, 3).map(area => <span key={area}>{area}</span>)}</div><div className="grant-card-meta"><span><small>Potential award</small>{amount}</span><span><small>Eligibility</small>{grant.applicant_types.slice(0, 2).join(', ')}</span></div><div className="grant-card-footer"><small>Verified {new Date(grant.last_verified_at).toLocaleDateString()}</small><a href={grant.application_url} target="_blank" rel="noreferrer">View official source ↗</a></div></article>
}

function profileCompletion(organization: Organization) {
  const fields = [organization.name, organization.description, organization.organization_type, organization.regions, organization.focus_areas, organization.annual_budget_cents, organization.team_size]
  return Math.round(fields.filter(Boolean).length / fields.length * 100)
}

export default App
