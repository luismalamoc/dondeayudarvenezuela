import Acerca from './pages/Acerca'
import Admin from './pages/Admin'
import Home from './pages/Home'
import Publicar from './pages/Publicar'

export default function App() {
  const path = window.location.pathname

  if (path.startsWith('/admin')) return <Admin />
  if (path.startsWith('/publicar')) return <Publicar />
  if (path.startsWith('/acerca') || path.startsWith('/about')) return <Acerca />
  return <Home />
}
