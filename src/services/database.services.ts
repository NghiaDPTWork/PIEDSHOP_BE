import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/User.schema'
import RefreshToken from '~/models/RefeshToken.schema'
dotenv.config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@shoppingcartk19f3.jzdpcdt.mongodb.net/?appName=shoppingCartK19F3`

/*
    Khi export class có một vấn đề
        1. Luôn tạo đối tượng ở nhiều file (vì be cần gioa tiếp với database)
            => Phí hao
    => Giải pháp là mình export ra object đã được khởi tạo 
    => Giảm thiểu tình tạng tạo mới trong xuyên suốt dự án

*/
class DatabaseServices {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    //

    try {
      // Send a ping to confirm a successful connection
      // await this.client.db('shoppingCartBE').command({ ping: 1 })
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  // Ở đây kiểu dữ liệu là collection<Document> nên phải định nghĩa lại
  // collection<User>
  // Vấn đề là trong User có gì ?
  // => Mình sẽ định nghĩa User (models)

  // Đưa về thành thuộc tính (Thuộc tính của database)
  get users(): Collection<User> {
    // Để trông trơn là nó không có nhận diện được đâu
    // Nên mình phải định nghĩa lại cho nó để nó hiểu
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  // Đưa về thành thuộc tính (Thuộc tính của database)
  get refeshTokens(): Collection<RefreshToken> {
    // Tạo một cáu table là refes
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }
}

// dependecy injection pattern : Kỹ thuật bơm
let databaseServices = new DatabaseServices()
// databaseServices.users.insertOne()
// Khúc này Kỹ thuật lắm nha coi kỹ ở đây nha

export default databaseServices
