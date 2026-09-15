export default function Loading() {
  return (
    <main className="public-page">
      <section className="public-hero"><div className="container skeleton-block"><span /><span /><span /></div></section>
      <section className="container content-section">
        <div className="skeleton-toolbar" />
        <div className="skeleton-grid">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-card" key={i}><span /><span /><span /><span /></div>)}</div>
      </section>
    </main>
  );
}
