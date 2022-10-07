import { useEffect, useState, useCallback, useMemo } from 'react'
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'

import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import KeyboardCommandKeyTwoToneIcon from '@mui/icons-material/KeyboardCommandKeyTwoTone'
import CottageIcon from '@mui/icons-material/Cottage'

import AppError from '_shared/client/components/AppError'
import Link from '_shared/client/components/Link'
import Form from '_shared/client/components/Form'
import ButtonRow from '_shared/client/components/ButtonRow'
import ErrorMessage from '_shared/client/components/ErrorMessage'
import { useQuery, useCommandOnMount } from '_shared/client/cqrs.js'
import InspectObject from '_shared/client/components/InspectObject'
// import { useCurrentAgent } from '../resources/auth'
// import LinkToDid from '../components/LinkToDid'
// import CopyButton from '../components/CopyButton'

const defaultExec = () => ({
  isCommand: false,
  name: '',
  optionsJson: '{}',
})

const searchToString = object => (new URLSearchParams(object)).toString()
const searchToObject = search => Object.fromEntries((new URLSearchParams(search)).entries())

export default function DebugPage() {
  const location = useLocation()
  const name = location.pathname.split('/').reverse()[0]
  const search = searchToObject(location.search)
  const optionsJson = search.opts
  useEffect(
    () => { document.title = `Debug ${process.env.APP_NAME}: ${name}(${optionsJson || ''})` },
    [name, optionsJson]
  )
  const { result: spec, error } = useQuery('__spec')
  const props = { spec, name, optionsJson }
  return <Container maxWidth={false} disableGutters>
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      minWidth: '100vw',
    }}>
      <SideNav {...{spec}}/>
      <Box sx={{ flex: '1 1', p: 2 }}>
        <ErrorMessage {...{error}}/>
        <ErrorBoundary FallbackComponent={AppError}>
          <Routes>
            <Route
              path="/q/:name"
              element={<ExecForm key={name} {...props} type="query"/>}
              title="do a query"
            />
            <Route
              path="/c/:name"
              element={<ExecForm key={name} {...props} type="command"/>}
              title="do a command"
            />
          </Routes>
        </ErrorBoundary>
      </Box>
    </Box>
  </Container>
}

function SideNav({ spec }){
  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'primary.dark',
    minWidth: `max(10vw, 175px)`,
    maxWidth: `max(20vw, 400px)`,
    overflowX: 'auto',
  }}>
    <Typography variant="h6"
      sx={{
        my: 2,
        textAlign: 'center',
      }}
    >Debug {process.env.APP_NAME}</Typography>
    <SideNavButton {...{
      to: `/`,
      icon: <CottageIcon/>,
      title: 'Home',
    }}/>
    <SideNavButtonList {...{
      name: 'Queries',
      types: spec?.queries,
      icon: <HelpOutlineIcon/>,
      linkPrefix: '/debug/q/',
    }}/>
    <SideNavButtonList {...{
      name: 'Commands',
      types: spec?.commands,
      icon: <KeyboardCommandKeyTwoToneIcon/>,
      linkPrefix: '/debug/c/',
    }}/>
  </Box>
}

function SideNavButton({ icon, title, subtitle, ...props }){
  if (props.to) props.component = Link
  return <ListItem disablePadding>
    <ListItemButton {...props}>
      <ListItemIcon sx={{minWidth: '30px'}}>
        {icon}
      </ListItemIcon>
      <ListItemText primary={title} secondary={subtitle} />
    </ListItemButton>
  </ListItem>
}

function SideNavButtonList({ name, types, icon, linkPrefix }){
  return <Box>
    <Typography variant="h6" sx={{pl: 1}}>{name}</Typography>
    <List dense sx={{pt: 0}}>
      {Array.isArray(types)
        ? [...types].sort().map(({name, args}) =>
          <SideNavButton {...{
            key: name,
            to: `${linkPrefix }${name}`,
            icon,
            title: name,
            subtitle: args,
          }}/>
        )
        : Array(3).fill().map((_, i) =>
          <Skeleton key={i} animation="wave" height="40px" />
        )
      }
    </List>
  </Box>
}

function ExecForm({ spec, type, name, optionsJson = '{}' }){
  const location = useLocation()
  const navigate = useNavigate()
  const isCommand = type === 'command'
  const options = safeJsonParse(optionsJson)
  const optionsJsonIsValid = !(options instanceof Error)
  const submittable = !!(name && optionsJsonIsValid)

  const [execution, setExecution] = useState(
    (type === 'query' && submittable)
      ? { name, options }
      : null
  )
  const [executionDone, setExecutionDone] = useState(false)


  const setOptionsJson = useCallback(
    (optionsJson, replace = false) => {
      // TODO include other existing search params
      const params = {}
      if (optionsJson) params.opts = optionsJson
      const newSearch = searchToString(params)
      let url = location.pathname
      if (newSearch) url += '?' + newSearch
      navigate(url, { replace })
    },
    [],
  )

  const reset = useCallback(
    () => {
      setOptionsJson(undefined, false)
      setExecution(null)
      setExecutionDone(false)
    },
    [setOptionsJson],
  )

  const onSubmit = useCallback(
    () => { if (submittable) setExecution({ id: Date.now(), options }) },
    [name, options],
  )

  const names = spec && (isCommand ? spec.commands : spec.queries) || []
  const disabled = !!(execution && !executionDone)
  const Exec = isCommand ? ExecuteCommand : ExecuteQuery

  return <Box>
    <Form {...{disabled, onSubmit}}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Typography variant="h4">{type}</Typography>
          <Select
            value={name}
            // onChange={e => setName(e.target.value)}
            autoWidth
          >
            {names.map(({name}) =>
              <MenuItem
                key={name}
                value={name}
                component={Link}
                to={`/debug/${isCommand ? 'c': 'q'}/${name}`}
              >{name}</MenuItem>)
            }
          </Select>
        </Stack>
        <TextField
          disabled={disabled}
          label="options (JSON)"
          fullWidth
          multiline
          value={optionsJson}
          onChange={e => {
            const optionsJson = e.target.value
            setOptionsJson(e.target.value, true)
            // const newSearch = searchToString({opts: optionsJson})
            // let url = location.pathname
            // if (newSearch) url += '?' + newSearch
            // navigate(url, { replace: true })
          }}
          error={optionsJsonIsValid ? false : true /*'invalid json'*/}
        />
        <ButtonRow sx={{mt: 2}}>
          <Button
            disabled={disabled || !submittable}
            variant="contained"
            type="submit"
            autoFocus
          >{isCommand ? 'execute' : 'query'}</Button>

          <Button
            disabled={disabled}
            variant="text"
            onClick={reset}
          >{'reset'}</Button>
        </ButtonRow>
      </Stack>
    </Form>
    <hr/>
    <Box>
      {execution
        ? <Exec {...{
          key: execution.id,
          id: execution.id,
          name,
          options: execution.options,
          onComplete(){ setExecutionDone(true) }
        }}/>
        : null
      }
    </Box>
  </Box>
}

function ExecuteQuery({ id, name, options, onComplete }){
  const results = useQuery(name, options, {
    dedupingInterval: 0,
    revalidateOnMount: true,
    revalidateOnFocus: true,
    onSuccess(...args){ console.log('ExecuteQuery', 'onSuccess', args) },
    onError(...args){ console.log('ExecuteQuery', 'onError', args) },
  })
  useEffect(() => { console.log('ExecuteQuery MOUNT', { id, name, options })}, [])
  useEffect(
    () => { if (!results.loading) onComplete() },
    [results.loading]
  )
  return <Execution {...{ ...results, name, options, }}/>
}

function ExecuteCommand({ name, options, onComplete }){
  const results = useCommandOnMount(name, options, { onComplete })
  return <Execution {...{ ...results, name, options, }}/>
}

function Execution({ name, options, result, loading, error }){
  return <Box>
    {
      loading
        ? <CircularProgress/>
        : error
          ? <ErrorMessage error={error}/>
          : <>
            <Typography variant="h6">result:</Typography>
            <InspectObject object={result}/>
          </>
    }
  </Box>
}

function Command({ name, options,  ...prop }){
  const command = useCommandOnMount(name, options)
  return <Tile {...{ title: `command: ${name}`, ...prop}}>
    <InspectObject object={{ options }}/>
    <InspectObject object={command}/>
  </Tile>
}

function safeJsonParse(json){
  try{
    return JSON.parse(json)
  } catch(error){
    return error
  }
}
