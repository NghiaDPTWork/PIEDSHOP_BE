import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import {
  ChangePasswordRequestBody,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RefeshTokenRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  TokenPayLoad,
  UpdateMeRequestBody,
  VerifyEmailRequestQuery,
  VerifyForgotPasswordRequestBody
} from '~/models/request/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import usersServices from '~/services/users.services'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'

/*
  Kiểu,Ví dụ,Dùng ở đâu?
    Snake_case,forgot_password_token,"SQL Database, Python, biến cục bộ (C++ cũ)."
    CamelCase,forgotPasswordToken,"JavaScript/TypeScript (React, Node), Java, JSON key, MongoDB."
    Kebab-case,forgot-password-token,"URL (API path), HTTP Header, CSS Class, tên file."
*/

// Login
export const loginController = async (
  req: Request<ParamsDictionary, any, LoginRequestBody>, //
  res: Response
) => {
  // Dữ liệu được gữi lên cho mình thông qua body gồm email và password
  const result = await usersServices.login(req.body)

  // Đóng gói
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
    // Ở đây mình trả về cặp vé ac và rf nha
  })

  // Bản cũ nha
  // const { email, password } = req.body

  // if (email != 't.nghia21@gmail.com' || password != '123') {
  //   return res.status(401).json({ message: 'Invalid email or password' })
  // }
  // // Đóng gói
  // return res.status(200).json({ message: 'Login successfully' })
}

// Register
export const registerController = async (
  // Định nghĩa thành phần trong request
  req: Request<ParamsDictionary, any, RegisterRequestBody>, //
  res: Response
) => {
  // Khưi lỗi ra nha
  // Bug : Có đỏ và xanh nha fen
  // const error = validationResult(req)
  // if (!error.isEmpty()) {
  //   return res.status(400).json({
  //     message: 'Register failed',
  //     error: error.mapped()
  //   })
  // }

  // const { email, password } = req.body
  // Cần định nghĩa body nha fen

  // Vì hệ thống luôn luôn sẽ có nguy cơ tạo ra lỗi nên là mình phải
  // bọc try - catch ở mọi chỗ để phòng vệ
  // Dữ liệu mà vào được đến tầng này thì nó đã sạch và đủ rồi
  // Mình sẽ kiểm tra tính logic - có liên quan đến database đúng của dữ liệu

  //  - Kiểm tra email đã có người dùng chưa ?
  const user = await usersServices.checkEmailExist(req.body.email)
  // lúc đầu là email
  if (user) {
    // return res.status(400).json({ message: 'Email already exists' })
    // Viết vậy là dở nha fen
    // Bản 1 nha
    // const customError = new Error('Email already exists')
    // Object.defineProperty(customError, 'message', {
    //   enumerable: true
    // })
    // throw customError
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY, // 422
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
    })
    // Mình phải cấu hình lạ bộ cờ để kshoong bị bỏ qua lõi nha
  }
  //  - Tạo user mới và lưu trữ
  const result = await usersServices.register(req.body) // khúc này mình có 5 thuộc tính đã được định nghĩa rồi nha
  // *  Đóng gói reponse

  //   return res.status(200).json({
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

// Logout
export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutRequestBody>, //
  res: Response
) => {
  console.log(req.decoded_authorization)
  // req có 6 vùng - express định nghĩa
  // Nên mình phải vào type.d.ts để định nghĩa lại

  // Đến đây thì dữ liệu đã sạch và ac và rf đã đc decode
  // Mình sẽ so sánh 2 user_id trong paylod của ac và rf
  const { user_id: user_id_ac } = req.decoded_authorization as TokenPayLoad
  const { user_id: user_id_rf } = req.decoded_refresh_token as TokenPayLoad

  // Nếu không khớp thì
  if (user_id_ac !== user_id_rf) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED, // 401
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
    })
  }

  // Nếu khớp thì
  // Kiểm tra (tìm) xem rf còn tồn tại trong database hay không ?
  await usersServices.checkRefeshToken({
    user_id: user_id_ac,
    refresh_token: req.body.refresh_token
  })

  // Nếu còn thì tiến hành xóa
  await usersServices.logout({
    refresh_token: req.body.refresh_token
  })

  // Thông báo thành công
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}

// Verify Email
export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, any, VerifyEmailRequestQuery>, //
  res: Response
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayLoad
  const { email_verify_token } = req.query

  // Kiểm tra email_verify_token này có
  await usersServices.checkEmailVerifyToken({
    user_id,
    email_verify_token
  })

  // phải thuộc sở hữu của user_id không ?
  // verifyEmai(cập nhật thông tin user)
  await usersServices.verifyEmail(user_id)

  // Thông báo thành công
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS
  })
}

// Resend verify email
export const resendVerifyEmailController = async (
  req: Request<ParamsDictionary, any, any, any>, //
  res: Response
) => {
  // Đến được tầng này thì đã qua đc AccessTokenValidator
  // Đến đây thì ac_token đã đc decoded_authorization và trong đó có
  // user_id dùng user_id để tìm user và lấy ra thông tin verify
  // Từ đó nếu chưa verify thì gửi mail Verify
  const { user_id } = req.decoded_authorization as TokenPayLoad
  const verify = await usersServices.getVerifyStatus(user_id)

  // Nếu tráng thái verify của người dùng là 1: (là đã verified ) thì mình
  // không gữi lại link
  if (verify == UserVerifyStatus.Verified) {
    return res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  // Nếu tráng thái verify của người dùng là 1: (là đã verified ) thì mình
  // không gữi lại link
  if (verify == UserVerifyStatus.Banned) {
    return res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED
    })
  }

  // Nếu tráng thái verify của người dùng là 1: (là đã verified ) thì mình
  // không gữi lại link
  if (verify == UserVerifyStatus.Unverified) {
    await usersServices.resendVerifyEmail(user_id)
    return res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    })
  }
}

// Forgot password
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>, //
  res: Response
) => {
  // Người ta gửi mail để xin link minh fphair xem email nàu
  // có thuộc sở hữu của user nào không
  const { email } = req.body
  const isExist = await usersServices.checkEmailExist(email)
  if (!isExist) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND, // 404
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  // Nếu có thì mình mới tạo forgot_password_token và gữi mail
  await usersServices.forgotPassword(email)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.CHECK_YOUR_EMAIL_TO_RESET_PASSWORD
  })
}

// Verify forgot password
export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordRequestBody>, // Mình định nghĩa ở đây luôn nha
  res: Response
) => {
  // Vì có khả năng user sẽ ấn nhiều lần vào link trong mail
  // Nên mình phải kiểm tra tính hợp lệ của forgot_password_token
  // có còn hiệu lực trong database không
  const { forgot_password_token } = req.body
  const { user_id } = req.decoded_fogot_password_token as TokenPayLoad

  // Kiểm tra tính hợp lệ của forgot_password_token
  // có còn hiệu lực trong database không
  await usersServices.checkForgotPasswordToken({
    user_id,
    forgot_password_token
  })

  // Nếu mã có trong database là hợp lệ
  // Thông báo thành công về cho frontend để hiển thị form nhập mật khẩu mới
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

// Reset password
export const resetPasswordController = async (
  // Bước định nghĩa luông là bước quan trọng không được quên nha
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>, //
  res: Response
) => {
  // Vì người dùng có gữi lên mình forgot_password_token trong body
  // nên mình cần kiểm tra xem có hợp lệ không
  const { forgot_password_token, password } = req.body
  const { user_id } = req.decoded_fogot_password_token as TokenPayLoad

  // Kiểm tra tính hợp lệ của forgot_password_token
  await usersServices.checkForgotPasswordToken({
    user_id,
    forgot_password_token
  })

  // Nếu có thì mình tiến hành đổi mật khẩu
  await usersServices.resetPassword({
    user_id,
    password
  })

  // Thông báo thành công
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
  })
}

// Get user profile --- IGNORE ---
export const getMeController = async (
  req: Request<ParamsDictionary, any, any>, //
  res: Response
) => {
  // Bước 1: Mình phải kiểm tra used_id có còn trong hệ thông không (có bị banned hay chưa)
  const { user_id } = req.decoded_authorization as TokenPayLoad

  // Bước 2: Lấy thông tin cá nhân của user đó
  const userInfor = await usersServices.getMe(user_id)

  // Bước 3: Đóng gói và trả về
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: userInfor
  })
}

// Update user profile
export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeRequestBody>, //
  res: Response
) => {
  // Bước 1: Mình phải kiểm tra user đã verify chưa (có bị banned hay chưa)
  const { user_id } = req.decoded_authorization as TokenPayLoad
  const verify = await usersServices.getVerifyStatus(user_id)

  // Bước 2: Nếu  chưa verify thì mình không cho update
  if (verify != UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED, // 401
      message: USERS_MESSAGES.USER_NOT_VERIFIED
    })
  }
  // Bước 2.1: Nếu rồi thì mình cho update
  await usersServices.updateMe({ used_id: user_id, payload: req.body })

  // Bước 3: Đóng gói và trả về
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESS
  })
}

// Chnage password
export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordRequestBody>, //
  res: Response,
  next: NextFunction
) => {
  // Lấy user_id ra
  const { user_id } = req.decoded_authorization as TokenPayLoad
  const { old_password, password } = req.body

  // Dựa trên user_id mình sẽ thay đổi mật khẩu
  await usersServices.changePassword({ user_id, old_password, password })

  //Trả về kiện hàng
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
  })
}

// Refesh Token
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefeshTokenRequestBody>, //
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const { user_id } = req.decoded_refresh_token as TokenPayLoad

  // Check
  await usersServices.checkRefeshToken({ user_id, refresh_token })

  // Neu thanh cong => Tien hanh refeshToken
  await usersServices.refeshToken({ user_id, refresh_token })

  // Hứng kqua va trả ra
  const result = await usersServices.refeshToken({ user_id, refresh_token })
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.REFESH_TOKEN_SUCCESS,
    result // ac vaf rf
  })
}
