import { postJSON } from '../lib/http.js'
import db from '../prisma/client.js'
// import jlinx from '../jlinx.js'

const contracts = {
  queries: {

    async byId({ id }){
      const [contractRecord, jlinxContract] = await Promise.all([
        db.contract.findUnique({ where: { id } }),
        jlinx.contracts.get(id),
      ])
      if (!jlinxContract) return
      const contract = {...jlinxContract.value, id}
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
      await Promise.all(
        contracts.map(async contract => {
          const jlinxContract = await jlinx.contracts.get(contract.id)
          Object.assign(contract, jlinxContract.value)
        })
      )
      return contracts
    }
  },

  commands: {
    async offer(options){
      const {
        identifierDid,
        contractUrl,
        userId,
      } = options
      // TODO ensure identifierDid exists and is ours
      const contract = await jlinx.contracts.create()
      await contract.offerContract({
        offerer: identifierDid,
        contractUrl,
        signatureDropoffUrl: `${process.env.URL}/api/jlinx/contracts/signatures`
      })
      console.log('CREATED CONTRACT', contract, contract.value)
      await db.contract.create({
        data: {
          id: contract.id,
          userId
        },
      })
      return { id: contract.id }
    },

    async sign({ contractId, userId, identifierDid }){
      const contract = await jlinx.contracts.get(contractId)
      if (!contract) throw new Error(`invalid contractId "${contractId}"`)
      await contract.update()
      console.log('SIGNING CONTRACT', { contract })

      // TODO ensure valid contract for signing
      // TODO ensure identifierDid is ours
      const signature = await contract.sign({
        identifier: identifierDid,
      })
      console.log('SIGNED CONTRACT', { signature })

      console.log('DROPPING OFF SIGNATURE', {
        signatureDropoffUrl: contract.signatureDropoffUrl,
      })
      await postJSON(
        contract.signatureDropoffUrl,
        {
          signatureId: signature.id,
        }
      )
      await contract.update()
      console.log('DROPPED OFF SIGNATURE', { contract })
      // TODO persist a record of this for the current user
      return { signatureId: signature.id }
    },

    async ackSignature({ signatureId }){
      console.log('ackSignature', { signatureId })
      const contractParty = await jlinx.contracts.getParty(signatureId)
      console.log('ackSignature', { contractParty })
      const { contractId } = contractParty
      console.log('ackSignature', { contractId })
      const contract = await jlinx.contracts.get(contractId)
      if (!contract) throw new Error(`invalid contractId "${contractId}"`)
      await contract.ackSignerResponse(signatureId)
      console.log('ACK\'d CONTRACT SIGNATURE', contract)
      return { contractId }
    },
  },

  actions: {
    async offer({ currentUser, ...options }){
      return await contracts.commands.offer({
        identifierDid: options.identifierDid,
        contractUrl: options.contractUrl,
        userId: currentUser.id,
      })
    },
    async sign({ currentUser, contractId, identifierDid }){
      // TODO ensure signAs identifier did is owned by us
      return await contracts.commands.sign({
        userId: currentUser.id,
        contractId,
        identifierDid,
      })
    },
    async ackSignature({ contractId, signatureId }){
      return await contracts.commands.ackSignature({
        // userId: currentUser.id,
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
