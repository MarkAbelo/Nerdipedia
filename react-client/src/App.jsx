import { Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/authContext'
import Register from './components/Register'
import Login from './components/Login'

function App() {

  return (
    <AuthProvider>
      <header>
      </header>
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
