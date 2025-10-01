import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

type MeetingItem = { id: string; title: string };

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [title, setTitle] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [datetime, setDatetime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const res = await fetch(`${base}/api/meetings`);
        const json = await res.json();
        setMeetings(json.items || []);
      } catch {
        // ignore for now
      }
    }
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/api/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, zoomLink, datetime })
      });
      if (!res.ok) {
        const msg = (await res.json()).message || 'Failed to create meeting';
        throw new Error(msg);
      }
      setTitle('');
      setZoomLink('');
      setDatetime('');
      // reload list
      const listRes = await fetch(`${base}/api/meetings`);
      const json = await listRes.json();
      setMeetings(json.items || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Meetings</title>
      </Head>
      <main style={{ padding: 24, maxWidth: 720 }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/">← Home</Link>
        </div>
        <h1>Meetings</h1>

        <section style={{ marginTop: 16, marginBottom: 24 }}>
          <h2 style={{ marginBottom: 8 }}>New Meeting</h2>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <input
              type="url"
              placeholder="Zoom link"
              value={zoomLink}
              onChange={e => setZoomLink(e.target.value)}
              required
            />
            <input
              type="datetime-local"
              value={datetime}
              onChange={e => setDatetime(e.target.value)}
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Meeting'}
            </button>
            {error ? <p style={{ color: 'red' }}>{error}</p> : null}
          </form>
        </section>

        <section>
          <h2 style={{ marginBottom: 8 }}>Meeting Titles</h2>
          <ul>
            {meetings.map(m => (
              <li key={m.id}>{m.title || '(untitled)'}</li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}


