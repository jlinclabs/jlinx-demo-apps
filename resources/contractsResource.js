import { postJSON } from '../lib/http.js'
import db from '../prisma/client.js'
import { JlinxClient } from '../jlinx.js'

const contracts = {
  queries: {

    async byId({ id }){
      const jlinx = new JlinxClient()
      const [contractRecord, jlinxContract] = await Promise.all([
        db.contract.findUnique({ where: { id } }),
        jlinx.contracts.get(id),
      ])
      if (!jlinxContract) return
      const contract = {
        ...jlinxContract.content,
        id
      }
      delete contract.contractId
      if (contractRecord){
        contract.userId = contractRecord.userId
        contract.createdAt = contractRecord.createdAt
      }
      // if (!contract) return
      // await decorateContract(contract)
      return contract
    },

    async forUser({ userId }){
      const contracts = await db.contract.findMany({
        where: { userId }
      })
      // TODO: group by identifierId to improve performance
      await Promise.all(
        contracts.map(async contract => {
          const jlinx = new JlinxClient(contract.userId, contract.identifierId)
          const jlinxContract = await jlinx.contracts.get(contract.id)
          Object.assign(contract, jlinxContract.content)
        })
      )
      return contracts
    }
  },

  commands: {
    async offer(options){
      const {
        identifierId,
        contractUrl,
        userId,
      } = options

      const jlinx = new JlinxClient(userId, identifierId)
      const contract = await jlinx.contracts.offerContract({
        // offerer: identifierId,
        contractUrl,
        signatureDropoffUrl: `${process.env.URL}/api/jlinx/contracts/signatures`
      })
      const id = contract.id.toString()
      await db.contract.create({
        data: {
          id,
          userId,
          identifierId,
        },
      })
      return { id }
    },

    async sign({ contractId, userId, identifierId }){
      if (!contractId) throw new Error('contractId is required')
      if (!userId) throw new Error('userId is required')
      if (!identifierId) throw new Error('identifierId is required')
      console.log('SIGNING CONTRACT', { contractId, userId, identifierId })
      const jlinx = new JlinxClient(userId, identifierId)
      const contract = await jlinx.contracts.get(contractId)
      if (!contract) throw new Error(`invalid contractId "${contractId}"`)
      await contract.sync()
      console.log('SIGNING CONTRACT', contract, contract.content)

      // TODO ensure valid contract for signing
      // TODO ensure identifierId is ours
      const signature = await contract.sign()
      console.log('SIGNED CONTRACT', signature, signature.content)

      console.log('DROPPING OFF SIGNATURE', {
        signatureDropoffUrl: contract.signatureDropoffUrl,
      })
      await postJSON(
        contract.signatureDropoffUrl,
        {
          contractId,
          signatureId: signature.id.toString(),
        }
      )
      await contract.sync()
      console.log('DROPPED OFF SIGNATURE', contract, contract.content)
      // TODO persist a record of this for the current user
      return { signatureId: signature.id }
    },

    async ackSignature({ signatureId, contractId }){
      console.log('ackSignature', { signatureId })

      // get userid for contractId
      const record = await db.contract.findUnique({
        where: { id: contractId },
        select: {
          userId: true,
          identifierId: true,
        },
      })
      if (!record) throw new Error(`contract not found id=${contractId}`)

      let jlinx = new JlinxClient(record.userId, record.identifierId)
      const [contract, signature] = await Promise.all([
        jlinx.contracts.get(contractId),
        jlinx.contracts.getSignature(signatureId),
      ])
      console.log('ACK SIG', { contract, signature })

      await contract.ackSignature(signature)

      // const signature = await jlinx.contracts.getParty(signatureId)
      // console.log('ackSignature', { signature })
      // const { contractId } = signature
      // console.log('ackSignature', { contractId })
      // const contract = await jlinx.contracts.get(contractId)
      // if (!contract) throw new Error(`invalid contractId "${contractId}"`)
      // await contract.ackSignerResponse(signatureId)
      console.log('ACK\'d CONTRACT SIGNATURE', contract, contract.content)
      return { contractId }
    },
  },

  actions: {
    async offer({ currentUser, ...options }){
      return await contracts.commands.offer({
        identifierId: options.identifierId,
        contractUrl: options.contractUrl,
        userId: currentUser.id,
      })
    },
    async sign({ currentUser, contractId, identifierId }){
      // TODO ensure signAs identifier did is owned by us
      return await contracts.commands.sign({
        userId: currentUser.id,
        contractId,
        identifierId,
      })
    },
    async ackSignature({ contractId, signatureId }){
      return await contracts.commands.ackSignature({
        // userId: currentUser.id, // not current user for this one
        contractId,
        signatureId,
      })
    },
  },

  views: {
    'mine': async ({ currentUser }) => {
      return currentUser
        ? await contracts.queries.forUser({ userId: currentUser.id })
        : []
    },
    ':id': async ({ id }) => {
      return await contracts.queries.byId({ id })
    }
  }
}


export default contracts
