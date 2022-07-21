import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './css/theme'
import Routes from './Routes'

function App() {
  return (
    <ThemeProvider {...{theme}}>
      <CssBaseline />
      <Routes/>
    </ThemeProvider>
  )
}

export default App
