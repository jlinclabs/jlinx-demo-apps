import { Routes as _Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'
import IdentifiersIndexPage from './pages/IdentifiersIndexPage'
import IdentifiersShowPage from './pages/IdentifiersShowPage'

export default function Routes() {
  return <_Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/logout" element={<LogoutPage />} />
    <Route path="/identifiers" element={<IdentifiersIndexPage />} />
    <Route path="/identifiers/:did" element={<IdentifiersShowPage />} />
  </_Routes>
}


