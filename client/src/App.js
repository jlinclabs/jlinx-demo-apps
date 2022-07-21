import { ThemeProvider, CssBaseline } from '@mui/material'
import Button from '@mui/material/Button'
import theme from './css/theme'

function App() {
  return (
    <ThemeProvider {...{theme}}>
      <CssBaseline />
      <div className="App">
        <Button variant="contained">nice</Button>
      </div>
    </ThemeProvider>
  )
}

export default App
