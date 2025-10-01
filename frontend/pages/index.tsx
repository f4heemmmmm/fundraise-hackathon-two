import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Next 13.5.11 Pages Router Starter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ padding: 24 }}>
        <h1>Hackathon 2!</h1>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <Link href="/meetings">Meetings →</Link>
          <Link href="/tasks">Tasks →</Link>
        </div>
      </main>
    </>
  );
}


