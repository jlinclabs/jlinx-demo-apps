import { Routes as _Routes, Route } from 'react-router-dom'

export default function Routes(){
  return <_Routes>
    <Route path="/" element={<div>homepage</div>} />
    <Route path="/login" element={<div>login page</div>} />
  </_Routes>
}
