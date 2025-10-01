import Head from 'next/head';
import Link from 'next/link';

export default function TasksPage() {
  return (
    <>
      <Head>
        <title>Tasks</title>
      </Head>
      <main style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/">← Home</Link>
        </div>
        <h1>Tasks</h1>
        <p>This page is intentionally left blank for now.</p>
      </main>
    </>
  );
}


