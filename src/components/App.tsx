import { useEffect } from 'react';
import Header from './Header';
import Home from './Home';
import LessonPage from './LessonPage';
import PartPage from './PartPage';
import SearchPage from './SearchPage';
import TicketsPage from './TicketsPage';
import WordsPage from './WordsPage';
import { course } from '../lib/course';
import { useRoute } from '../lib/router';
import { useTheme } from '../lib/theme';

function App() {
  const route = useRoute();
  const { theme, toggle } = useTheme();
  const routeKey = JSON.stringify(route);
  useEffect(() => {
    if (route.name === 'tickets' && route.key) return;
    window.scrollTo({ top: 0 });
  }, [routeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <Header route={route} theme={theme} onToggleTheme={toggle} />
      <main className="main" key={route.name === 'lesson' ? route.id : route.name}>
        {route.name === 'home' && <Home />}
        {route.name === 'part' && <PartPage id={route.id} />}
        {route.name === 'lesson' && <LessonPage id={route.id} />}
        {route.name === 'tickets' && <TicketsPage focusKey={route.key} />}
        {route.name === 'words' && <WordsPage />}
        {route.name === 'search' && <SearchPage initial={route.q} />}
      </main>
      <footer className="site-foot">
        <span>Agent Platform Academy · drafting sheets for the agent platform · {course.lessonCount} lessons · {course.ticketCount} tickets</span>
      </footer>
    </div>
  );
}

export default App;
