import { Route, Routes } from 'react-router'
import Layout from './components/Layout.tsx'
import Browse from './pages/Browse.tsx'
import Home from './pages/Home.tsx'
import MyList from './pages/MyList.tsx'
import News from './pages/News.tsx'
import Profiles from './pages/Profiles.tsx'
import NotFound from './pages/NotFound.tsx'
import Search from './pages/Search.tsx'
import TitleDetails from './pages/TitleDetails.tsx'
import Watch from './pages/Watch.tsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="series"
          element={<Browse key="series" type="series" heading="Series" />}
        />
        <Route
          path="peliculas"
          element={<Browse key="movie" type="movie" heading="Películas" />}
        />
        <Route path="novedades" element={<News />} />
        <Route path="mi-lista" element={<MyList />} />
        <Route path="perfiles" element={<Profiles />} />
        <Route path="titulo/:id" element={<TitleDetails />} />
        <Route path="buscar" element={<Search />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* El reproductor ocupa toda la pantalla, sin header ni footer */}
      <Route path="ver/:id" element={<Watch />} />
    </Routes>
  )
}

export default App
