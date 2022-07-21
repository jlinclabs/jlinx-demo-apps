import { ThemeProvider, CssBaseline } from '@mui/material'
import { Routes, Route } from 'react-router-dom'

import theme from './css/theme'
import HomePage from './pages/HomePage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'
import IdentifiersPage from './pages/IdentifiersPage'

function App() {
  return (
    <ThemeProvider {...{theme}}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/identifiers" element={<IdentifiersPage />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
