import { Route, Routes } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Signout from './components/signout'

function App() {

  return (
    <>
      <header>
        <NavBar/>
      </header>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/createpost' element={<></>} />
        <Route path='/signout' element={<Signout />} />
      </Routes>
    </>
  )
}

export default App
