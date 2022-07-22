import Routes from './Routes'
import ErrorBoundary from './components/ErrorBoundary'
export default function App() {
  return (
    <ErrorBoundary {...{ onError }}>
      <Routes/>
    </ErrorBoundary>
  )
}


function onError(error){
  return <div>
    <h1>APP ERROR</h1>
    <h2>{error.message}</h2>
    <pre>{error.stack}</pre>
  </div>
}
