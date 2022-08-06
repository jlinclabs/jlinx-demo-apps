import { Routes as _Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'
import ProfilesPage from './pages/ProfilesPage'
import IdentifiersPage from './pages/IdentifiersPage'
import ContractsIndexPage from './pages/ContractsPage'

export default function Routes() {
  return <_Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/logout" element={<LogoutPage />} />
    <Route path="/profiles/*" element={<ProfilesPage />} />
    <Route path="/identifiers/*" element={<IdentifiersPage />} />
    <Route path="/contracts/*" element={<ContractsIndexPage />} />
  </_Routes>
}
