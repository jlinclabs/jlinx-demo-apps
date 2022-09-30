import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'

import defaultTheme from './theme'
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
          <CssBaseline />
          <Routes/>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}


// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log)

// import Routes from './Routes'
// import AppError from './components/AppError'

// export default function App() {
//   return (
//     <ErrorBoundary FallbackComponent={AppError}>
//       <Routes/>
//     </ErrorBoundary>
//   )
// }
