import { TokenPayLoad } from './models/request/User.requests'
import { Request } from 'express'

// Mình sẽ vào và định nghĩa lại code của express
declare module 'express' {
  interface Request {
    decoded_authorization?: TokenPayLoad
    decoded_refresh_token?: TokenPayLoad
    decoded_email_verify_token?: TokenPayLoad
    decoded_fogot_password_token?: TokenPayLoad
  }
}
