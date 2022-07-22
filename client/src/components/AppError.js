import * as React from 'react'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

export default function AppError({error, resetErrorBoundary}) {
  return (
    <Container maxWith="lg">
      <Paper
        elevation={3}
        role="alert"
        sx={{ m: 3, p: 3 }}
      >
        <Alert severity="error">App Error</Alert>
        <Box component="pre" sx={{overflow: 'scroll'}}>
          <Typography variant="h4">{error.message}</Typography>
          <br/>
          {error.stack}
        </Box>
        <Button
          variant="contained"
          onClick={resetErrorBoundary}
        >Try again</Button>
      </Paper>
    </Container>
  )
}
