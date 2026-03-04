// Lưu những mô tả request chức năng có liên qun đến đối tượng User

import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'
import { ParsedQs } from 'qs'

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface LogoutRequestBody {
  refresh_token: string
}

export interface TokenPayLoad extends JwtPayload {
  user_id: string
  token_type: TokenType
}

//
export interface VerifyEmailRequestQuery extends ParsedQs {
  email_verify_token: string
}

//
export interface ForgotPasswordRequestBody {
  email: string
}

//
export interface VerifyForgotPasswordRequestBody {
  forgot_password_token: string
}

//
export interface ResetPasswordRequestBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}

//
export interface UpdateMeRequestBody {
  name?: string
  date_of_birth?: string
  // String là string ISO8601 nha fen
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

//
export interface ChangePasswordRequestBody {
  old_password: string
  password: string
  confirm_password: string
}

//
export interface RefeshTokenRequestBody {
  refresh_token: string
}
