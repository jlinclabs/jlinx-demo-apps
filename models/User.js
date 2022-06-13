const knex = require('../postgresql')

class User {

  static async all(){
    const records = await knex('users').select('*')
    return records.map(record => new User(record))
  }

  static async auth(username, password){
    console.log('User.auth', { username, password })
    const user = await this.findByUsername(username)
    return !!(user && await user.verifyPassword(password))
  }

  static async findById(userId){
    const [ record ] = await knex('users')
      .select('*')
      .where({ id: userId })
      .limit(1)
    if (record) return new User(record)
  }

  static async findByUsername(username){
    const [ record ] = await knex('users')
      .select('*')
      .where({ username })
      .limit(1)
    if (record) return new User(record)
  }

  static async create(values = {}){
    let record = {
      created_at: new Date,
    }
    if (values.username){
      record.username = values.username
    }
    if (values.jlinxAppUserId){
      record.jlinx_app_user_id = values.jlinxAppUserId
    }
    const rows = await knex('users')
      .insert(record)
      .returning('*')
    return new User(rows[0])
  }

  constructor(record){
    this._update(record)
  }

  _update(record){
    if (!record || !record.id) throw new Error(`bad record`)
    this.id = record.id
    this.username = record.username
    this.jlinxAppUserId = record.jlinx_app_user_id
  }

  async update(changes){
    const records = await knex('users')
      .update({
        username: changes.username,
        updated_at: new Date,
      })
      .where({ id: this.id })
      .returning('*')
      this._update(records[0])
  }

}

module.exports = User

//   constructor({ url, pg, hl }){
//     this.pg = pg
//     this.hl = hl
//     this.appUrl = url
//   }

//   async getAll(){
//     console.log('Users.getAll')
//     const users = await this.pg.many('SELECT * FROM users')
//     await this._loadHyperlincProfiles(users)
//     console.log('Users.getAll', users)
//     return users
//   }

//   async get(username){
//     const [ user ] = await this.pg.many(
//       `SELECT * FROM users WHERE username = $1`,
//       [username],
//     )
//     if (user) await this._loadHyperlincProfiles([user])
//     return user
//   }

//   async _loadHyperlincProfiles(users){
//     const profiles = await this.hl.getProfiles(
//       users.map(u => u.hyperlinc_id)
//     )
//     users.forEach((user, index) => {
//       const profile = profiles[index]
//       const { realname, email } = profile
//       Object.assign(user, { realname, email })
//     })
//   }

//   async create({ username, hyperlincId, jlincDid }){
//     console.log('CREATE USER', { username, hyperlincId })
//     try{
//       if (await this.get(username))
//         throw new Error(`"${username}" is taken`)

//       console.log((hyperlincId ? `loading` : `creating`) + ` hyperlinc ID`)
//       const hlIdentity = hyperlincId
//         ? await this.hl.getIdentity(hyperlincId)
//         : await this.hl.createIdentity({ appUrl: this.appUrl })

//       console.log('inserting user')
//       const user = await this.pg.one(
//         `
//         INSERT INTO users(username, hyperlinc_id, jlinc_did)
//         VALUES($1, $2, $3)
//         RETURNING *
//         `,
//         [username, hlIdentity.id, jlincDid]
//       )
//       if (!user) throw new Error(`failed to insert user`)

//       if (hlIdentity.secretKey){
//         console.log('inserting secret key')
//         await this.pg.one(
//           `
//           INSERT INTO hyperlinc_secret_keys
//           VALUES($1, $2) RETURNING *
//           `,
//           [hlIdentity.id, hlIdentity.secretKey]
//         )
//       }

//       return await this.get(username)
//     }catch(error){
//       console.error('users.create failed', error)
//       throw error
//     }
//   }

//   async _getHyperlincIdentity(username){
//     const record = await this.pg.one(
//       `
//         SELECT
//           users.username,
//           users.hyperlinc_id,
//           hyperlinc_secret_keys.hyperlinc_secret_key
//         FROM users
//         LEFT JOIN hyperlinc_secret_keys
//         ON hyperlinc_secret_keys.hyperlinc_id = users.hyperlinc_id
//         WHERE username=$1
//       `,
//       [username]
//     )
//     if (!record){
//       console.error(`bad username? "${username}"`)
//       return
//     }

//     return await this.hl
//       .getIdentity(record.hyperlinc_id, record.hyperlinc_secret_key)
//   }

//   async findByHyperlincId(hyperlincId){
//     const user = await this.pg.one(
//       `SELECT username FROM users WHERE hyperlinc_id=$1`,
//       [hyperlincId]
//     )
//     if (user) return await this.get(user.username)
//   }

//   async findByJlincDid(jlincDid){
//     const user = await this.pg.one(
//       `SELECT username FROM users WHERE jlinc_did=$1`,
//       [jlincDid]
//     )
//     if (user) return await this.get(user.username)
//   }

//   // async getHyperlincProfile(hyperlincId){
//   //   const hlIdentity = await this.hl.getIdentity(hyperlincId)
//   //   return await hlIdentity.getProfile()
//   // }

//   async updateProfile(username, changes){
//     const hlIdentity = await this._getHyperlincIdentity(username)
//     await hlIdentity.patchProfile(changes)
//   }

//   async _getAllHyperlincEvents(username){
//     const hlIdentity = await this._getHyperlincIdentity(username)
//     await hlIdentity.update()
//     return await hlIdentity.getAllEvents()
//   }

// }


