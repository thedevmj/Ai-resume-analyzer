import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Upload from './pages/Upload'
import Home from './components/Home'
import Navbar from './components/Navbar'



export default function App() {
 
  return (
    <>
    <Navbar/>
    <Routes>
      <Route path="/" element={<><Home/></>}></Route>
      <Route path="/fileupload" element={<><Upload/></>}></Route>
    </Routes>
    </>
  )
}
