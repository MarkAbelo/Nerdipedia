import { Route, Routes } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import Home from './components/Home'

function App() {

  return (
    <>
      <header>
        <NavBar/>
      </header>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
      </Routes>
    </>
  )
}

export default App
