export default function Header({ title }) {
  return (
    <header className="header">
      <h1>{title}</h1>
      <div className="header-actions">
        <span className="tag">Modern Dashboard</span>
      </div>
    </header>
  );
}
