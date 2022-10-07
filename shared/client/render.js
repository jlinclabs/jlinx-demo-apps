import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'

import defaultTheme from './theme'
import DebugPage from './pages/DebugPage'
import NotFoundPage from './pages/NotFoundPage'
import './cqrs'
// import App from './App'
// import reportWebVitals from './reportWebVitals'

const root = ReactDOM.createRoot(document.querySelector('body > main'))

export default function render(opts = {}){
  const {
    Routes,
    theme = defaultTheme,
  } = opts
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider {...{theme}}>
          <CssBaseline enableColorScheme />
          <Routes>
            <Route path="/debug/*" element={<DebugPage/>}/>
            <Route path="*" element={<NotFoundPage/>}/>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}
// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log)
