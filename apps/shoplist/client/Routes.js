import { Routes as _Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'

export default function Routes(){
  return <_Routes>
    <Route path="/" element={<HomePage/>} />
    <Route path="/login" element={<div>login page</div>} />
  </_Routes>
}
