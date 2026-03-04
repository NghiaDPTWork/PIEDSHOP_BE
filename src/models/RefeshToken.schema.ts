// Dùng interface để mô tả 1 rf token cần những gì

import { ObjectId } from 'mongodb'
//interface dùng để định nghĩa kiểu dữ liệu
//interface không có thể dùng để tạo ra đối tượng

interface RefreshTokenType {
  _id?: ObjectId // khi tạo cũng k cần (Mongo tạo ra)
  token: string // Quan trọng
  created_at?: Date // k có cũng đc, khi tạo object thì ta sẽ new Date() sau
  user_id: ObjectId // Quan trọng
}

//  ttl : time to live (cái này có sẵn của Mongo) => Tính hạn sử dụng tự động xóa mã khi hết hạn
//  Cronjob(C#) => Không cài trên server mà cài trực tiếp trên máy
//  Mình cần làm theo cơ chế tự động chứ không làm thủ công
//  Class dùng để tạo ra đối tượng
//  Class sẽ thông qua interface
//  Thứ tự dùng như sau
//  Class này < databse < service < controller < route < app.ts < server.ts < index.ts

export default class RefreshToken {
  _id?: ObjectId //khi client gửi lên thì không cần truyền _id
  token: string
  created_at: Date
  user_id: ObjectId
  constructor({ _id, token, created_at, user_id }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.created_at = created_at || new Date()
    this.user_id = user_id
  }
}
