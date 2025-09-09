import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from './url/u'
import Teto from './pages/teto'
import Home from './pages/home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.TETO} element={<Teto />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App

