import { Route, Routes } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import PrivateRoute from './components/PrivateRoute'
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
import Movie from './components/Movie'
import NotFound from './components/NotFound'
function App() {

  return (
    <>
      <header>
        <NavBar/>
      </header>
      <div className='mainBody'>
        <br/>
      <Routes>
        {/*Public Routes*/}
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/show/:id' element={<Show />} />
        <Route path='/shows' element={<Shows />} />
        <Route path='/movie/:id' element={<Movie />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/book/:id' element={<Book />} />
        <Route path='/books' element={<Books />} />
        <Route path='/dnd' element={<DnD />} />
        <Route path='/post/:id' element={<Post/>} />
        <Route path='/account/:id' element={<Profile />} />
        <Route path='/show/:id' element={<Show />} />
        <Route path='/book/:id' element={<Book />} />
        <Route path='*' element={<NotFound/>}/>
        {/*Private Routes*/}
        <Route path='/createpost' element={<PrivateRoute/>} >
          <Route path='/createpost' element={<CreatePost/>} />
        </Route>
        <Route path='/signout' element={<PrivateRoute />}>
          <Route path='/signout' element={<Signout />} />
        </Route>

      </Routes>
      </div>
      <br/>
    </>
  )
}

export default App
