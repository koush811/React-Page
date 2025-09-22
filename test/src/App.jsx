import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from './url/u'
import Teto from './pages/tetopage/Teto'
import Home from './pages/home'
import Osero from './pages/oseropage/osero'

import './App.css'
import './index.css'
import Gandam from './pages/gandam/gandam'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.TETO} element={<Teto />} />
        <Route path={ROUTES.OSERO} element={<Osero/>}/>
        <Route path={ROUTES.GANDAM} element={<Gandam/>}/>
      </Routes>
    </BrowserRouter>
    
  )
}
export default App


