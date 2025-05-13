import { Route, Routes } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Signout from './components/signout'
import Show from './components/Show'
import Shows from './components/Shows'
import Movies from './components/Movies'
import Book from './components/book'
import Books from './components/Books'
import DnD from './components/Dnd'
import Post from './components/Post'
import Profile from './components/Profile'
import CreatePost from './components/CreatePost'
// import Movie from './components/Movie'
function App() {

  return (
    <>
      <header>
        <NavBar/>
      </header>
      <div className='mainBody'>
        <br/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/createpost' element={<CreatePost/>} />
        <Route path='/signout' element={<Signout />} />
        <Route path='/show/:id' element={<Show />} />
        <Route path='/shows' element={<Shows />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/books' element={<Books />} />
        <Route path='/dnd' element={<DnD />} />
        <Route path='/post/:id' element={<Post/>} />
        <Route path='/account/:id' element={<Profile />} />
        <Route path='/show/:id' element={<Show />} />
        <Route path='/book/:id' element={<Book />} />
      </Routes>
      </div>
      <br/>
    </>
  )
}

export default App
