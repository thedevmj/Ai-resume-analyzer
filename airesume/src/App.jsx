import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Upload from './pages/Upload'

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/fileupload" element={<><Upload/></>}></Route>
    </Routes>
    </>
  )
}
