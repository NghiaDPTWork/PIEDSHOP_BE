import jwt from 'jsonwebtoken'

// Dùng evn nhớ phải có cái này nha không là nó import bậy bạ nha
import dotenv from 'dotenv'
import { TokenPayLoad } from '~/models/request/User.requests'
dotenv.config()

// Tạo ra hàm ký Token
// Header - Payload - Sceret : Cấu tạo của JWT
// option(Header): Thuật toán mã hóa là gì + Ngày hết hạn
export const signToken = (
  //   payload: any, //
  //   privatekey: string,
  //   options: jwt.SignOptions

  // Lần 2:
  // Nên truyền dulieu dưới dạng object nha
  {
    payload, //
    privatekey, // = process.env.JWT_SECRET as string
    options = { algorithm: 'HS256' }
  }: {
    payload: any
    privatekey: string
    options?: jwt.SignOptions
  }
) => {
  // Nhớ định nghĩa mọi thứ thật kỹ nhé
  // Lần 1
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privatekey, options, function (err, token) {
      if (err) throw reject(err)
      else return resolve(token as string)
    })
  })
}

// Verify Token
export const verifyToken = ({
  token, //
  privateKey // = process.env.JWT_SECRET as string
  // Phải nói cho hệ thống biết nó là String
}: {
  token: string
  privateKey: string
}) => {
  // Về bản chất hàm này chỉ đồng bộ nội bộ thôi
  // Nên là khi ta muốn hệ thống chờ nó thì mình cần phải đưa về promise nhé
  // Và hàm này ban đầu trả về void nên cũng không async được lun á

  return new Promise<TokenPayLoad>((resolve, reject) => {
    // Mình phải định nghĩa kỹ cho hệ thống biết kiểu trả ra nha
    jwt.verify(token, privateKey, function (err, decoded) {
      if (err) throw reject(err)
      resolve(decoded as TokenPayLoad)
    })
  })
}
