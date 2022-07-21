import { Routes as _Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'

import IdentifiersIndexPage from './pages/IdentifiersIndexPage'
import IdentifiersShowPage from './pages/IdentifiersShowPage'

import ContractsIndexPage from './pages/ContractsIndexPage'
import ContractsShowPage from './pages/ContractsShowPage'
import ContractsOfferPage from './pages/ContractsOfferPage'
import ContractsSignPage from './pages/ContractsSignPage'

export default function Routes() {
  return <_Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/logout" element={<LogoutPage />} />

    <Route path="/identifiers" element={<IdentifiersIndexPage />} />
    <Route path="/identifiers/:did" element={<IdentifiersShowPage />} />

    <Route path="/contracts" element={<ContractsIndexPage />} />
    <Route path="/contracts/:id" element={<ContractsShowPage />} />
    <Route path="/contracts/offer" element={<ContractsOfferPage />} />
    <Route path="/contracts/sign" element={<ContractsSignPage />} />
  </_Routes>
}


