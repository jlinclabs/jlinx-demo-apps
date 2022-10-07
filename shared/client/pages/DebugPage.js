import { useState, useCallback, useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
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

export default function DebugPage() {
  const [newExec, setNewExec] = useState(defaultExec())

  return <Container maxWidth={false} disableGutters>
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      minWidth: '100vw',
    }}>
      <SideNav/>

      <ErrorBoundary>
        <Routes>
          <Route path="/q/:name" element={<DebugQueryPage/>}/>
          <Route path="/c/:name" element={<DebugCommandPage/>}/>
        </Routes>
      </ErrorBoundary>
    </Box>
  </Container>
}

function SideNav({ onSelect }){
  const queries = useQuery('__queries')
  const commands = useQuery('__commands')

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
    >DEBUG</Typography>
    {[queries, commands].map(({ result, loading, error }, index) => {
      const isQuery = index === 0
      const names = (result || []).filter(n => !n.startsWith('__'))
      return <Box key={isQuery ? 'q' : 'c'}>
        <Typography variant="h6" sx={{px: 1}}>
          {isQuery ? 'Queries' : 'Commands'}
        </Typography>
        <ErrorMessage {...{error}}/>
        <List dense>
          {loading
            ? Array(3).fill().map((_, i) =>
              <Skeleton key={i} animation="wave" height="40px" />
            )
            : names.map(name =>
              <ListItem key={name} disablePadding>
                <ListItemButton component={Link} to={`/debug/${isQuery ? 'q' : 'c'}/${name}`}>
                  <ListItemIcon sx={{minWidth: '30px'}}>
                    {isQuery ? <HelpOutlineIcon/> : <KeyboardCommandKeyTwoToneIcon/>}
                  </ListItemIcon>
                  <ListItemText primary={name} />
                </ListItemButton>
              </ListItem>
            )
          }
        </List>
      </Box>
    })}
    {/* <ListOfQueries {...{onSelect}}/>
    <ListOfCommand {...{onSelect}}/> */}
  </Box>
}

function ListOfQueries({ onSelect }){
  const { result, loading, error } = useQuery('__queries')
  const queries = (result || [])
    .filter(query => !query.startsWith('__'))
  return <Box>
    <Typography variant="h6" sx={{p: 1}}>Queries</Typography>
    <ErrorMessage {...{error}}/>
    {loading ? <CircularProgress/> :
      <List>
        {queries.map(query =>
          <ListItem key={query} disablePadding>
            <ListItemButton onClick={() => {
              onSelect({query})
            }}>
              <ListItemIcon sx={{minWidth: '30px'}}>
                <HelpOutlineIcon/>
              </ListItemIcon>
              <ListItemText primary={query} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    }
  </Box>
}

function ListOfCommand(){
  const query = useQuery('__commands')
  return <InspectObject object={query} />
}

function Formmmmmmm() {
  const [newExec, setNewExec] = useState(defaultExec())
  const [executions, setExecutions] = useState([])

  const reset = useCallback(
    () => { setNewExec(defaultExec()) },
    []
  )
  const addExecution = useCallback(
    () => {
      const { isCommand, name, optionsJson } = newExec
      setExecutions([
        ...executions,
        { isCommand, name, options: JSON.parse(optionsJson) }
      ])
      // reset()
    },
    [newExec, executions],
  )
  const remExecution = useCallback(
    index => {
      const dup = [...executions]
      dup.splice(index, 1)
      setExecutions(dup)
    },
    [executions],
  )
  const editExecution = useCallback(
    index => {
      const { isCommand, name, options } = executions[index]
      setNewExec({ isCommand, name, optionsJson: JSON.stringify(options) })
    },
    [executions],
  )

  return <Container sx={{p: 2}}>
    <Typography variant="h3">DEBUG {process.env.APP_NAME}</Typography>
    <ExecForm {...{reset, newExec, setNewExec, addExecution}}/>
    <Box sx={{display: 'grid'}}>
      {executions.map((exec, index) => {
        const props = {
          key: index,
          ...exec,
          onDestroy(){ remExecution(index) },
          onEdit(){ editExecution(index) },
        }
        return exec.isCommand
          ? <Command {...props}/>
          : <Query {...props}/>
      })}
    </Box>
  </Container>
}

function ExecForm({ reset, newExec = {}, setNewExec, addExecution }){
  const { isCommand, name, optionsJson } = newExec
  const options = safeJsonParse(optionsJson)
  const optionsJsonIsValid = !(options instanceof Error)
  const submittable = !!(name && optionsJsonIsValid)

  const [
    setIsCommand,
    setName,
    setOptionsJson,
  ] = useMemo(
    () => {
      const patch = prop => value => setNewExec({ ...newExec, [prop]: value })
      return [
        patch('isCommand'),
        patch('name'),
        patch('optionsJson'),
      ]
    },
    [newExec]
  )

  const onSubmit = useCallback(
    () => { if (submittable) addExecution() },
    [newExec, setNewExec],
  )

  const queryForQueries = useQuery('__queries')
  const queryForCommands = useQuery('__commands')
  const namesQuery = (isCommand ? queryForCommands : queryForQueries)
  const names = namesQuery.result || []

  const disabled = (
    queryForQueries.loading ||
    queryForCommands.loading
  )

  return <Form {...{disabled, onSubmit}}>
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Select
          value={isCommand}
          onChange={e => setIsCommand(!!e.target.value)}
          autoWidth
        >
          <MenuItem value={false}>Query</MenuItem>
          <MenuItem value={true}>Command</MenuItem>
        </Select>
        <Select
          value={name}
          onChange={e => setName(e.target.value)}
          autoWidth
        >
          {names.map(name =>
            <MenuItem key={name} value={name}>{name}</MenuItem>)
          }
        </Select>
        {/* <TextField
          disabled={disabled}
          label={`${isCommand ? 'command' : 'query'} name`}
          fullWidth
          value={name}
          onChange={e => setName(e.target.value)}
        /> */}
      </Stack>
      <TextField
        disabled={disabled}
        label="options (JSON)"
        fullWidth
        multiline
        value={optionsJson}
        onChange={e => setOptionsJson(e.target.value)}
        error={optionsJsonIsValid ? false : true /*'invalid json'*/}
      />
      <ButtonRow sx={{mt: 2}}>
        <Button
          disabled={disabled || !submittable}
          variant="contained"
          type="submit"
        >{isCommand ? 'execute' : 'query'}</Button>

        <Button
          disabled={disabled}
          variant="text"
          onClick={reset}
        >{'reset'}</Button>
      </ButtonRow>
    </Stack>
  </Form>
}

function Tile({ children, title, onDestroy, onEdit }){
  return <Paper sx={{p:1}}>
    <ButtonRow sx={{ float: 'right' }}>
      <IconButton
        color="primary"
        aria-label="destroy"
        component="label"
        onClick={onEdit}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        color="primary"
        aria-label="destroy"
        component="label"
        onClick={onDestroy}
      >
        <CloseIcon />
      </IconButton>
    </ButtonRow>
    <Typography variant="h5">{title}</Typography>
    {children}
  </Paper>
}

function Query({ name, options, ...prop }){
  const query = useQuery(name, options)
  const params = new URLSearchParams(options)
  return <Tile {...{ title: `query: ${name}?${params}`, ...prop}}>
    {
      query.loading
        ? <CircularProgress/>
        : query.error
          ? <ErrorMessage error={query.error}/>
          : <>
            <Typography variant="body">result:</Typography>
            <InspectObject object={query.result}/>
          </>
    }
  </Tile>
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
