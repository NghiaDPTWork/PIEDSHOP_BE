/*
    Middle wares: Handler function ở giữa trong quá trình xử lý Reques (nên có next)
    Controller: Handler function ở cuối trong quá trình xử lý Request

    - Chức năng: Login
        path: /users/login
        method: POST
        headers | body | params | query
        body: {
            email: string,
            password: string,
            confirm_password: string,
            name: string,
            date_of_brith: ISO8601
            // Về bản chất khi truyền thì nó là String
            // Nhưng đưa vào xử lý thì nó sẽ được chuyển thành Date
        }
        loginValidator: kiểm tra tính hợp lệ của email, password
        loginController kiểm tra database(services), đóng gói kiện hàng

    - Chức năng: Register
        path: users/register
        method: post
        body: {
            email: string,
            name: string,
            password: string,
            confirm_password: string,
            date_of_birth: ISO8601
        }
        registerValidator: kiểm tra tính hợp lệ của email, password
        registerController: kiểm tra database(services), đóng gói kiện hàng

    - Chức năng: Logout
        path: users/logout
        method: post (Vì phải trả lại 2 cái mã)
        // Vì sao nó lại nằm trên header vậy nhỉ 
        // Về bản chất là Logout không phải là rời đi mà là mình đi vào xin hệ thống 
        // thu hồi 2 cái vé để mình không đăng nhập vào nữa
        // Nên để logout bắt buộc mình phải nói cho hê thống biết mình là ai
        // Và hệ thống  phải xác minh mình là ai thì mới tiến hành xóa mã (thu hồi quyền) của mình
        headers{
          Authorization: 'Bearer access_token'
        }
        body: {
            refresh_token: string
        }
        registerValidator: kiểm tra tính hợp lệ của email, password
        registerController: kiểm tra database(services), đóng gói kiện hàng

    

    - Chức năng: Resend-verify-email
      des: người dùng yêu cầu gữi lại mail verify
      path: /users/resend-verify-email
      method: post(Em muốn giữ lại thì em phải cho anh biết em là ai)
      headers{
        Authorization: 'Bearer access_token'
      }
      body: {
        refresh_token: string
      }

    - Chức năng: Verify Email
      des: Người dùng bấm vào link trong mail, là gián tiếp gữi lại email_verify_token
           cho mình thông qua request query
      path: /users/verify-email/?email_verify_email:String
      method: get
      thằng này là query nên không khai báo đc
      chỉ có param mới khai báo được
      chỉ là method vì chỉ cần ấn vào đường link thôi không gửi thông tin gì cả


    - Chức năng: Forgot Password
      des: Người dùng quên mật khẩu, yêu cầu gữi mail đặt lại mật khẩu
           nhớ rằng lúc này người dùng không còn gì cả ngoài email
      path: /users/forgot-password
      method: post
      body: {
        email: string
      }

    - Chức năng : Verify Forgot Password
      des: Người dùng bấm vào link trong mail, là gữi forgot_password_token cho frontend
           FE sẽ gữi lại BE để BE kiểm tra verify trước khi hiển thị nhập mật khẩu mới
      path: /users/verify-forgot-password?forgot_password_token:String
      method: POST
      body: {
        forgot_password_token: string
      }

    - Chức năng: Reset Password
      des: Người dùng nhập mật khẩu mới sau khi đã verify thành công forgot_password_token
           và mật khẩu được gửi về backend để cập nhật lại
      path: /users/reset-password
      method: POST
      body: {
        forgot_password_token: string,
        password: string,
        confirm_password: string
      }

    - Chức năng: Get user profile 
      des: Lấy thông tin cá nhân người dùng đang đăng nhập
      path : /users/profile
      method : POST (Vì mình phải cho hệ thống biết mình là ai thì mới lấy đc thông tin cá nhân chứ)
      headers {
        Authorization: 'Bearer access_token' (Cung cấp vé cho hệ thống biết mình là ai)
      }

    
    - Chức năng: Update user profile
      des: update profile của user
      path: '/me'
      method: patch
      Header: header: {
        Authorization: 'Bearer <access_token>'
      }
      body: {
        name?: string
        date_of_birth?: Date
        bio?: string // optional
        location?: string // optional
        website?: string // optional
        username?: string // optional
        avatar?: string // optional
        cover_photo?: string // optional
      }

    - Change password
      Reset pwd: Là m quên luôn mật khẩu
      Change pwd: Là m còn nhớ chỉ là muốn đổi để bảo mật
      - POST: Che dấu thôgn tin (Tôi đưa lên cho bạn cái gì đó)
      - PUT: Cập nhật (Tôi muốn thay đổi 1 cái gì đó)
      - PATCH: Cập nhật (Thay đổi nhiều thông tin)

      des: Thay đổi mật khẩu
      method: put
      header: {
        Authorization: 'Bearer <access_token>'
      }
      body : {
        old_password: string
        password: string
        confirm_password: string
      }

    - Chức năng: Refesh-token
      des: Khi người dùng hết hạn access_token thì họ sẽ gửi refesh_token
      lên xin access_token và refesh_token mới
      path: users/refesh-token
      method: post
      body : {
      refesh_token: string
      }

       
*/

import express from 'express'
import {
  changePasswordController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeRequestBody } from '~/models/request/User.requests'
import { wrapAsync } from '~/utils/handler'

const userRouter = express.Router()

// Login
userRouter.post(
  '/login',
  loginValidator, //
  wrapAsync(loginController)
)

// Register
userRouter.post(
  '/register',
  registerValidator, //
  wrapAsync(registerController)
)

// Logout
userRouter.post(
  '/logout',
  accessTokenValidator, //
  refreshTokenValidator,
  wrapAsync(logoutController)
)

// Verify Email
userRouter.get(
  '/verify-email', //
  emailVerifyTokenValidator, // Hàm kiểm tra email_verify_email
  wrapAsync(verifyEmailController)
)

// Resend Email
userRouter.post(
  '/resend-verify-email', //
  accessTokenValidator,
  wrapAsync(resendVerifyEmailController)
)

// Forgot password
userRouter.post(
  '/forgot-password', //
  forgotPasswordValidator, // Kiểm tra email người dùng gữi lên qua body
  wrapAsync(forgotPasswordController)
)

// Verify forgot password
userRouter.post(
  '/verify-forgot-password', //
  forgotPasswordTokenValidator, // Dùng lại hàm kiểm tra fogot_password_token
  wrapAsync(verifyForgotPasswordController)
)

// Reset password
userRouter.post(
  '/reset-password', //
  forgotPasswordTokenValidator,
  resetPasswordValidator, // Kiểm tra password, confirm_password
  wrapAsync(resetPasswordController)
)

// Get user profile
userRouter.post(
  '/me',
  accessTokenValidator, // verify access_token mình làm rồi
  wrapAsync(getMeController)
)

// Update user profile
userRouter.patch(
  '/me',
  filterMiddleware<UpdateMeRequestBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  accessTokenValidator, // verify access_token mình làm rồi
  updateMeValidator,
  wrapAsync(updateMeController)
)

// Change password
userRouter.put(
  '/change-password', //
  accessTokenValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)

// Refesh token
userRouter.post(
  '/refesh-token', //
  refreshTokenValidator,
  wrapAsync(refreshTokenController)
)

export default userRouter
