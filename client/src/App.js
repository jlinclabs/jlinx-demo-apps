import { ErrorBoundary } from 'react-error-boundary'
import Routes from './Routes'
import AppError from './components/AppError'

export default function App() {
  return (
    <ErrorBoundary
      FallbackComponent={AppError}
    >
      <Routes/>
    </ErrorBoundary>
  )
}
