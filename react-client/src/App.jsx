import { Route, Routes } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Signout from './components/signout'
import Show from './components/Show'

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
        <Route path='/show/:id' element={<Show />} />
      </Routes>
    </>
  )
}

export default App
