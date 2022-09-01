import { postJSON } from '../lib/http.js'
import db from '../prisma/client.js'
import { JlinxClient } from '../jlinx.js'

const sisas = {
  queries: {

    async byId({ id }){
      const jlinx = new JlinxClient()
      const [sisaRecord, jlinxSisa] = await Promise.all([
        db.sisa.findUnique({ where: { id } }),
        jlinx.sisas.get(id),
      ])
      if (!jlinxSisa) return
      const sisa = {
        ...jlinxSisa.content,
        id
      }
      delete sisa.sisaId
      if (sisaRecord){
        sisa.userId = sisaRecord.userId
        sisa.createdAt = sisaRecord.createdAt
      }
      // if (!sisa) return
      // await decorateContract(sisa)
      return sisa
    },

    async forUser({ userId }){
      const sisas = await db.sisa.findMany({
        where: { userId }
      })
      // TODO: group by identifierId to improve performance
      await Promise.all(
        sisas.map(async sisa => {
          const jlinx = new JlinxClient(sisa.userId, sisa.identifierId)
          const jlinxSisa = await jlinx.sisas.get(sisa.id)
          Object.assign(sisa, jlinxSisa.content)
        })
      )
      return sisas
    }
  },

  commands: {
    async offer(options){
      const {
        userId,
        identifierId,
        requestedDataFields,
      } = options

      const jlinx = new JlinxClient(userId, identifierId)
      const sisa = await jlinx.sisas.offerSisa({
        requestedDataFields,
        signatureDropoffUrl: `${process.env.URL}/api/jlinx/sisas/signatures`
      })
      const id = sisa.id.toString()
      await db.sisa.create({
        data: {
          id,
          userId,
          identifierId,
        },
      })
      return { id }
    },

    async sign({ sisaId, userId, identifierId }){
      if (!sisaId) throw new Error('sisaId is required')
      if (!userId) throw new Error('userId is required')
      if (!identifierId) throw new Error('identifierId is required')
      console.log('SIGNING CONTRACT', { sisaId, userId, identifierId })
      const jlinx = new JlinxClient(userId, identifierId)
      const sisa = await jlinx.sisas.get(sisaId)
      if (!sisa) throw new Error(`invalid sisaId "${sisaId}"`)
      await sisa.sync()
      console.log('SIGNING CONTRACT', sisa, sisa.content)

      // TODO ensure valid sisa for signing
      // TODO ensure identifierId is ours
      const signature = await sisa.sign()
      console.log('SIGNED CONTRACT', signature, signature.content)

      console.log('DROPPING OFF SIGNATURE', {
        signatureDropoffUrl: sisa.signatureDropoffUrl,
      })
      await postJSON(
        sisa.signatureDropoffUrl,
        {
          sisaId,
          signatureId: signature.id.toString(),
        }
      )
      await sisa.sync()
      console.log('DROPPED OFF SIGNATURE', sisa, sisa.content)
      // TODO persist a record of this for the current user
      return { signatureId: signature.id }
    },

    async ackSignature({ signatureId, sisaId }){
      console.log('ackSignature', { signatureId })

      // get userid for sisaId
      const record = await db.sisa.findUnique({
        where: { id: sisaId },
        select: {
          userId: true,
          identifierId: true,
        },
      })
      if (!record) throw new Error(`sisa not found id=${sisaId}`)

      let jlinx = new JlinxClient(record.userId, record.identifierId)
      const [sisa, signature] = await Promise.all([
        jlinx.sisas.get(sisaId),
        jlinx.sisas.getSignature(signatureId),
      ])
      console.log('ACK SIG', { sisa, signature })

      await sisa.ackSignature(signature)

      // const signature = await jlinx.sisas.getParty(signatureId)
      // console.log('ackSignature', { signature })
      // const { sisaId } = signature
      // console.log('ackSignature', { sisaId })
      // const sisa = await jlinx.sisas.get(sisaId)
      // if (!sisa) throw new Error(`invalid sisaId "${sisaId}"`)
      // await sisa.ackSignerResponse(signatureId)
      console.log('ACK\'d CONTRACT SIGNATURE', sisa, sisa.content)
      return { sisaId }
    },
  },

  actions: {
    async offer({ currentUser, ...options }){
      return await sisas.commands.offer({
        userId: currentUser.id,
        identifierId: options.identifierId,
        requestedDataFields: options.requestedDataFields,
      })
    },
    async sign({ currentUser, sisaId, identifierId }){
      // TODO ensure signAs identifier did is owned by us
      return await sisas.commands.sign({
        userId: currentUser.id,
        sisaId,
        identifierId,
      })
    },
    async ackSignature({ sisaId, signatureId }){
      return await sisas.commands.ackSignature({
        // userId: currentUser.id, // not current user for this one
        sisaId,
        signatureId,
      })
    },
  },

  views: {
    'mine': async ({ currentUser }) => {
      return currentUser
        ? await sisas.queries.forUser({ userId: currentUser.id })
        : []
    },
    ':id': async ({ id }) => {
      return await sisas.queries.byId({ id })
    }
  }
}


export default sisas
