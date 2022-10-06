import { useState, useCallback, useMemo } from 'react'
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

import InspectObject from '_shared/client/components/InspectObject'
import Form from '_shared/client/components/Form'
import ButtonRow from '_shared/client/components/ButtonRow'
import { useQuery } from '_shared/client/cqrs.js'
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
  const [executions, setExecutions] = useState([])

  const addExecution = useCallback(
    () => {
      setExecutions([
        ...executions,
        {
          id: Date.now(),
          isCommand: newExec.isCommand,
          name: newExec.name,
          options: JSON.parse(newExec.optionsJson),
        }
      ])
      setNewExec(defaultExec())
      // if (!submittable) return
      // console.log('NEW QUERY OR COMMAND!', { name, options })
      // const execution =
      // props.onSubmit({ key: Date.now(), name, options })
      // setName
      // setOptionsJson
    },
    [newExec, executions],
  )

  return <Container sx={{p: 2}}>
    <Typography variant="h3">DEBUG {process.env.APP_NAME}</Typography>
    <ExecForm {...{newExec, setNewExec, addExecution}}/>
    <Box sx={{display: 'grid'}}>
      {executions.map(exec =>
        exec.isCommand
          ? <Command {...{key: exec.id, ...exec}}/>
          : <Query {...{key: exec.id, ...exec}}/>
      )}
    </Box>
  </Container>
}

function ExecForm({ newExec = {}, setNewExec, addExecution }){
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

  console.log({ queryForCommands, queryForQueries })

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
            <MenuItem value={name}>{name}</MenuItem>)
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
      </ButtonRow>
    </Stack>
  </Form>
}

function Query({ id, name, options }){
  const query = useQuery(name, options)
  const params = new URLSearchParams(options)
  return <Paper sx={{p:1}}>
    <Typography variant="h5">query "{name}?{params}"</Typography>
    <InspectObject object={{ options }}/>
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
  </Paper>
}
function Command({ id, name, options}){
  const command = useCommand(name, options)
  return <Box>
    <InspectObject object={command}/>
  </Box>
}

function safeJsonParse(json){
  try{
    return JSON.parse(json)
  } catch(error){
    return error
  }
}
