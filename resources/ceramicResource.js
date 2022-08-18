import db from '../prisma/client.js'
import ceramic from '../ceramic.js'

const ceramicResource = {
  queries: {
    async getEventsById({ id }){
      const stream = await ceramic.loadStream(id)
      const { allCommitIds } = stream
      console.log({ allCommitIds })
      const events = []
      for (const commitId of allCommitIds){
        const stream = await ceramic.loadStream(commitId)
        events.push({
          id: commitId.toString(),
          content: stream.content,
          timestamp: null,
        })
      }
      return events
    },
  },

  commands: {

  },

  actions: {

  },

  views: {
    'events.:id': async ({ currentUser, id }) => {
      return await ceramicResource.queries.getEventsById({
        userId: currentUser.id, id
      })
    }
  }
}

export default ceramicResource
