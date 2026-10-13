import { href, type Route } from '../lib/router';
import type { Theme } from '../lib/theme';

type Props = { route: Route; theme: Theme; onToggleTheme: () => void };

function Header({ route, theme, onToggleTheme }: Props) {
  const links = [
    { name: 'home', label: 'Path', to: href.home() },
    { name: 'tickets', label: 'Tickets', to: href.tickets() },
    { name: 'words', label: 'Words', to: href.words() },
    { name: 'search', label: 'Search', to: href.search() },
  ] as const;
  const active = route.name === 'part' || route.name === 'lesson' ? 'home' : route.name;
  return (
    <header className="site-head">
      <a className="brand" href={href.home()}>
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-name">Agent Platform Academy</span>
      </a>
      <nav className="site-nav" aria-label="Site">
        {links.map((l) => (
          <a key={l.name} href={l.to} aria-current={active === l.name ? 'page' : undefined}>{l.label}</a>
        ))}
      </nav>
      <button type="button" className="theme-btn" onClick={onToggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title="Theme">
        {theme === 'dark' ? '☾' : '☀'}
      </button>
    </header>
  );
}

export default Header;
