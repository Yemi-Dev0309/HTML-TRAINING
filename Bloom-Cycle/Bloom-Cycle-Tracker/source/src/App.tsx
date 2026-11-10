import { useState } from 'react';
import {
  Flower2,
  CalendarDays,
  Heart,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Download,
  Trash2,
  X,
  Droplet,
} from 'lucide-react';
import './tracker.css';
import ComfortCorner from './ComfortCorner';

type Entry = {
  id: string;
  start: string;
  end: string;
  flow: string;
  symptoms: string[];
  notes: string;
};
type Data = { entries: Entry[]; cycle: number; duration: number };
const key = 'bloom-cycle-v1';
const iso = (d: Date) =>
  d.getFullYear() +
  '-' +
  String(d.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(d.getDate()).padStart(2, '0');
const date = (s: string) => new Date(s + 'T12:00:00');
const add = (s: string, n: number) => {
  const d = date(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const days = (a: string, b: string) =>
  Math.round((date(a).getTime() - date(b).getTime()) / 86400000);
const pretty = (s: string) =>
  date(s).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
const blank = (): Entry => ({
  id: '',
  start: iso(new Date()),
  end: '',
  flow: 'Medium',
  symptoms: [],
  notes: '',
});
function App() {
  const [data, setData] = useState<Data>(() => {
    try {
      const v = JSON.parse(localStorage.getItem(key) || 'null');
      if (
        v &&
        Array.isArray(v.entries) &&
        Number.isFinite(v.cycle) &&
        Number.isFinite(v.duration)
      )
        return v;
    } catch {}
    return { entries: [], cycle: 28, duration: 5 };
  });
  const [tab, setTab] = useState('Overview');
  const [month, setMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [form, setForm] = useState<Entry | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [remove, setRemove] = useState<string | null>(null);
  const [cycle, setCycle] = useState(data.cycle);
  const [duration, setDuration] = useState(data.duration);
  const today = iso(new Date());
  const entries = [...data.entries].sort((a, b) =>
    b.start.localeCompare(a.start)
  );
  const intervals = entries
    .slice(0, -1)
    .map((e, i) => days(e.start, entries[i + 1].start))
    .filter(n => n >= 15 && n <= 90);
  const average = intervals.length
    ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
    : data.cycle;
  const latest = entries[0];
  const next = latest ? add(latest.start, average) : null;
  const remaining = next ? days(next, today) : null;
  const cycleDay = latest ? days(today, latest.start) + 1 : null;
  function save(v: Data) {
    try {
      localStorage.setItem(key, JSON.stringify(v));
      setData(v);
      setError('');
      return true;
    } catch {
      setError(
        'Could not save on this device. Your browser storage may be full or unavailable. Export your existing data before trying again.'
      );
      return false;
    }
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.start || form.start > today)
      return setError('Choose a start date that is today or earlier.');
    if (form.end && (form.end < form.start || form.end > today))
      return setError(
        'End date must be on or after the start and no later than today.'
      );
    const finish = form.end || form.start;
    if (
      data.entries.some(
        x =>
          x.id !== form.id &&
          x.start <= finish &&
          (x.end || x.start) >= form.start
      )
    )
      return setError(
        'These dates overlap an existing period. Edit that log instead.'
      );
    const item = { ...form, id: form.id || crypto.randomUUID() };
    if (
      save({
        ...data,
        entries: [...data.entries.filter(x => x.id !== item.id), item],
      })
    ) {
      setForm(null);
      setNotice('Period log saved');
    }
  }
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bloom-cycle-data.json';
    a.click();
    URL.revokeObjectURL(url);
    setNotice('Your data was exported');
  }
  function open(v: Entry) {
    setError('');
    setForm(v);
  }
  const cells = Array.from(
    {
      length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
    },
    (_, i) => iso(new Date(month.getFullYear(), month.getMonth(), i + 1))
  );
  return (
    <div className="shell">
      <aside>
        <a
          className="brand"
          href="#"
          onClick={e => {
            e.preventDefault();
            setTab('Overview');
          }}
        >
          <span className="brand-icon">
            <Flower2 size={25} />
          </span>
          bloom<span className="brand-dot">.</span>
        </a>
        <p className="tagline">A little closer to yourself.</p>
        <nav>
          {[
            ['Overview', Heart],
            ['Calendar', CalendarDays],
            ['History', Droplet],
            ['Settings', Settings],
          ].map(([name, Icon]: any) => (
            <button
              key={name}
              className={tab === name ? 'active' : ''}
              onClick={() => {
                setTab(name);
                setError('');
              }}
            >
              <Icon size={19} />
              {name}
            </button>
          ))}
        </nav>
        <div className="private">
          <ShieldCheck size={23} />
          <strong>Your cycle. Your space.</strong>
          <p>Saved only in this browser. No account needed.</p>
        </div>
        <small className="aside-bottom">Made for your everyday rhythm</small>
      </aside>
      <main>
        <header>
          <div>
            <span className="eyebrow">YOUR PERSONAL CYCLE COMPANION</span>
            <h1>
              {tab === 'Overview'
                ? 'Get to know your rhythm'
                : tab === 'Calendar'
                  ? 'Your cycle calendar'
                  : tab === 'History'
                    ? 'Your period history'
                    : 'Make it yours'}
              <span className="title-dot">.</span>
            </h1>
            <p className="muted">
              {tab === 'Overview'
                ? 'A gentle space to track, reflect, and understand your cycle.'
                : 'Small details, a clearer picture of you.'}
            </p>
          </div>
          <button className="primary" onClick={() => open(blank())}>
            <Plus size={18} /> Log period
          </button>
        </header>
        {notice && (
          <div role="status" className="notice">
            {notice}
            <button
              aria-label="Dismiss notification"
              onClick={() => setNotice('')}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {error && !form && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {tab === 'Overview' && (
          <>
            <section className="hero">
              <div>
                <span className="pill">
                  <span /> YOUR CYCLE AT A GLANCE
                </span>
                <h2>
                  {!latest
                    ? 'Every cycle tells a story.'
                    : remaining !== null && remaining >= 0
                      ? 'Your next chapter is close.'
                      : 'Your rhythm is your own.'}
                </h2>
                <p>
                  {!latest
                    ? 'Start with your last period. We’ll help you keep track of what comes next.'
                    : 'Keep checking in with yourself, one day at a time.'}
                </p>
                <button className="light-btn" onClick={() => open(blank())}>
                  {latest ? 'Add a period log' : 'Log your first period'}{' '}
                  <Plus size={17} />
                </button>
                <small>Estimates adapt as you add more cycles.</small>
              </div>
              <div className="orbit">
                <div className="orbit-inner">
                  <Flower2 size={27} />
                  <span>
                    {remaining === null
                      ? 'Let’s begin'
                      : remaining < 0
                        ? 'Check in'
                        : remaining === 0
                          ? 'Today'
                          : remaining}
                  </span>
                  <p>
                    {remaining === null
                      ? 'Your story starts here'
                      : remaining < 0
                        ? 'Predicted date has passed'
                        : remaining === 0
                          ? 'Estimated period start'
                          : 'days until estimated period'}
                  </p>
                </div>
              </div>
            </section>
            <section className="stats">
              <article>
                <span className="stat-icon rose">
                  <CalendarDays size={20} />
                </span>
                <p>Next period</p>
                <h3>{next ? pretty(next) : 'Not estimated yet'}</h3>
                <small>
                  {latest
                    ? 'Estimated from your cycle history'
                    : 'Add your first period to begin'}
                </small>
              </article>
              <article>
                <span className="stat-icon lavender">
                  <Heart size={20} />
                </span>
                <p>Cycle length</p>
                <h3>
                  {average} <span>days</span>
                </h3>
                <small>
                  {intervals.length
                    ? 'Average of logged cycle intervals'
                    : 'Your starting cycle setting'}
                </small>
              </article>
              <article>
                <span className="stat-icon peach">
                  <Droplet size={20} />
                </span>
                <p>Current cycle day</p>
                <h3>
                  {cycleDay || '—'}
                  {cycleDay && <span> day</span>}
                </h3>
                <small>
                  {latest
                    ? 'Counted from your latest period start'
                    : 'Get to know your pattern'}
                </small>
              </article>
            </section>
          </>
        )}
        {(tab === 'Overview' || tab === 'Calendar') && (
          <section className="card calendar">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ONE DAY AT A TIME</span>
                <h2>Your calendar</h2>
              </div>
              <div className="month-nav">
                <button
                  aria-label="Previous month"
                  onClick={() =>
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() - 1, 1)
                    )
                  }
                >
                  <ChevronLeft size={18} />
                </button>
                <strong>
                  {month.toLocaleDateString(undefined, {
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
                <button
                  aria-label="Next month"
                  onClick={() =>
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() + 1, 1)
                    )
                  }
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="week">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="grid">
              {Array.from({ length: month.getDay() }, (_, i) => (
                <span key={'empty' + i} />
              ))}
              {cells.map(s => {
                const logged = entries.some(
                  e => s >= e.start && s <= (e.end || e.start)
                );
                const predicted =
                  !logged && next && s >= next && s < add(next, data.duration);
                return (
                  <div
                    key={s}
                    className={
                      'day ' +
                      (logged ? 'logged ' : predicted ? 'predicted ' : '') +
                      (s === today ? 'today' : '')
                    }
                    title={
                      logged
                        ? 'Logged period'
                        : predicted
                          ? 'Estimated period'
                          : s
                    }
                  >
                    <span>{date(s).getDate()}</span>
                  </div>
                );
              })}
            </div>
            <div className="legend">
              <span>
                <i className="logged" />
                Logged period
              </span>
              <span>
                <i className="predicted" />
                Estimated period
              </span>
              <span>
                <i className="today-key" />
                Today
              </span>
            </div>
          </section>
        )}
        {(tab === 'Overview' || tab === 'History') && (
          <section className="card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR PERSONAL PATTERNS</span>
                <h2>{tab === 'History' ? 'All period logs' : 'Recent logs'}</h2>
              </div>
              {tab === 'Overview' && (
                <button className="text-btn" onClick={() => setTab('History')}>
                  View history →
                </button>
              )}
            </div>
            {!entries.length ? (
              <div className="empty">
                <Droplet size={27} />
                <h3>A fresh start</h3>
                <p>
                  Your period logs will appear here. Add one whenever you’re
                  ready.
                </p>
                <button className="text-btn" onClick={() => open(blank())}>
                  + Add a period
                </button>
              </div>
            ) : (
              (tab === 'Overview' ? entries.slice(0, 3) : entries).map(e => (
                <div className="log" key={e.id}>
                  <span className="log-icon">
                    <Droplet size={20} />
                  </span>
                  <div className="log-body">
                    <strong>
                      {pretty(e.start)}
                      {e.end ? ' – ' + pretty(e.end) : ''}
                    </strong>
                    <p>
                      {e.flow} flow ·{' '}
                      {e.end
                        ? days(e.end, e.start) + 1 + ' days logged'
                        : 'Start date logged'}
                      {e.symptoms.length ? ' · ' + e.symptoms.join(', ') : ''}
                    </p>
                    {e.notes && <p className="notes">{e.notes}</p>}
                  </div>
                  <button className="text-btn" onClick={() => open(e)}>
                    Edit
                  </button>
                  <button
                    className="icon-btn"
                    aria-label={'Delete period ' + e.start}
                    onClick={() => setRemove(e.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))
            )}
          </section>
        )}
        {tab === 'Settings' && (
          <section className="card settings">
            <h2>Your cycle preferences</h2>
            <p className="muted">
              Used until enough period history is available. These values are
              estimates, not a diagnosis.
            </p>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (cycle < 15 || cycle > 90 || duration < 1 || duration > 15)
                  return setError(
                    'Enter a cycle length of 15–90 days and period length of 1–15 days.'
                  );
                if (save({ ...data, cycle, duration }))
                  setNotice('Preferences saved');
              }}
            >
              <label>
                Typical cycle length (days)
                <input
                  required
                  type="number"
                  min="15"
                  max="90"
                  value={cycle}
                  onChange={e => setCycle(Number(e.target.value))}
                />
              </label>
              <label>
                Typical period length (days)
                <input
                  required
                  type="number"
                  min="1"
                  max="15"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                />
              </label>
              <button className="primary">Save preferences</button>
            </form>
            <hr />
            <h2>Your data belongs to you</h2>
            <p className="muted">
              Logs are stored in this browser only. They won’t sync to other
              devices and may be lost if browser data is cleared. Anyone with
              access to this browser may see them.
            </p>
            <div className="actions">
              <button className="secondary" onClick={exportData}>
                <Download size={17} />
                Export data
              </button>
              <button className="danger" onClick={() => setRemove('all')}>
                <Trash2 size={17} />
                Delete all data
              </button>
            </div>
          </section>
        )}
        {tab === 'Overview' && <ComfortCorner />}
        <footer>
          <Flower2 size={19} />
          <p>
            Every body has its own rhythm. Predictions are approximate and may
            be less reliable with irregular cycles.
            <br />
            Bloom is for tracking, not diagnosis or contraception. It does not
            identify safe days or confirm ovulation.
          </p>
        </footer>
      </main>
      {form && (
        <div className="overlay">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Period log"
          >
            <div className="section-heading">
              <h2>{form.id ? 'Edit period' : 'Log your period'}</h2>
              <button
                className="icon-btn"
                aria-label="Close period form"
                onClick={() => {
                  setForm(null);
                  setError('');
                }}
              >
                <X />
              </button>
            </div>
            <p className="muted">A small check-in, just for you.</p>
            <form onSubmit={submit}>
              <div className="form-row">
                <label>
                  Start date
                  <input
                    type="date"
                    required
                    max={today}
                    value={form.start}
                    onChange={e => setForm({ ...form, start: e.target.value })}
                  />
                </label>
                <label>
                  End date (optional)
                  <input
                    type="date"
                    min={form.start}
                    max={today}
                    value={form.end}
                    onChange={e => setForm({ ...form, end: e.target.value })}
                  />
                </label>
              </div>
              <small>
                Leave the end date blank if you are only recording the start.
              </small>
              <label>
                Flow
                <select
                  value={form.flow}
                  onChange={e => setForm({ ...form, flow: e.target.value })}
                >
                  {['Light', 'Medium', 'Heavy'].map(x => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <fieldset>
                <legend>How are you feeling? (optional)</legend>
                <div className="symptoms">
                  {[
                    'Cramps',
                    'Headache',
                    'Bloating',
                    'Fatigue',
                    'Tender breasts',
                    'Mood changes',
                  ].map(s => (
                    <label
                      key={s}
                      className={form.symptoms.includes(s) ? 'checked' : ''}
                    >
                      <input
                        type="checkbox"
                        checked={form.symptoms.includes(s)}
                        onChange={() =>
                          setForm({
                            ...form,
                            symptoms: form.symptoms.includes(s)
                              ? form.symptoms.filter(x => x !== s)
                              : [...form.symptoms, s],
                          })
                        }
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label>
                Notes (optional)
                <textarea
                  maxLength={1000}
                  rows={3}
                  placeholder="Anything you’d like to remember…"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </label>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setForm(null);
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button className="primary">Save period</button>
              </div>
            </form>
          </section>
        </div>
      )}
      {remove && (
        <div className="overlay">
          <section
            className="modal small-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm deletion"
          >
            <h2>
              {remove === 'all'
                ? 'Delete all your data?'
                : 'Delete this period log?'}
            </h2>
            <p className="muted">
              This cannot be undone.
              {remove === 'all'
                ? ' Export a copy first if you want to keep your history.'
                : ''}
            </p>
            <div className="modal-actions">
              <button className="secondary" onClick={() => setRemove(null)}>
                Cancel
              </button>
              <button
                className="danger"
                onClick={() => {
                  if (
                    save(
                      remove === 'all'
                        ? { entries: [], cycle: 28, duration: 5 }
                        : {
                            ...data,
                            entries: data.entries.filter(e => e.id !== remove),
                          }
                    )
                  ) {
                    if (remove === 'all') {
                      setCycle(28);
                      setDuration(5);
                    }
                    setRemove(null);
                    setNotice('Data deleted');
                  }
                }}
              >
                Confirm delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
export default App;

