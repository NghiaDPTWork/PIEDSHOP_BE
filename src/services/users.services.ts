import User from '~/models/User.schema'
import databaseServices from './database.services'
import { LoginRequestBody, RegisterRequestBody, UpdateMeRequestBody } from '~/models/request/User.requests'
import { hash } from 'crypto'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { StringValue } from 'ms'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/RefeshToken.schema'
import { log } from 'console'

class UsersServices {
  // Ký tên
  private signAccessToken(user_id: string) {
    return signToken({
      privatekey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      payload: { user_id, token_type: TokenType.AccessToken },
      // Nhớ dùng câu lệnh này nha bạn
      // npm i ms
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN as StringValue }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      privatekey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      payload: { user_id, token_type: TokenType.RefreshToken },
      // Nhớ dùng câu lệnh này nha bạn
      // npm i ms
      options: { expiresIn: process.env.REFESH_TOKEN_EXPIRE_IN as StringValue }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      privatekey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      payload: { user_id, token_type: TokenType.RefreshToken },
      // Nhớ dùng câu lệnh này nha bạn
      // npm i ms
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN as StringValue }
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      privatekey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      payload: { user_id, token_type: TokenType.RefreshToken },
      // Nhớ dùng câu lệnh này nha bạn
      // npm i ms
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN as StringValue }
    })
  }

  // Login
  async login(payload: LoginRequestBody) {
    // Tìm user sỡ hữu 2 thông tin email và password
    const user = await databaseServices.users.findOne({
      ...payload, //
      password: hashPassword(payload.password)
    })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY, // 422
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
      })
    }

    // Nếu có user thì sao ?
    // Tạo ac và rf từ id của user tìm được
    const user_id = user._id.toString()

    // Ký ở đây
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])

    //Thiếu hành động lưu mã rf vào database
    await databaseServices.refeshTokens.insertOne(
      new RefreshToken({
        // Muốn đưa lại cho server thì phải đưa về ObjectId
        // Chứ không để string như mình đã chuyển về và xử lý nha
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    // Trả ra cặp cho người dùng nha
    return {
      access_token,
      refresh_token
    }
  }

  // Register
  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())

    const result = await databaseServices.users.insertOne(
      new User({
        _id: user_id,
        username: `user${user_id.toString()}`,
        email_verify_token,
        ...payload,
        // Mình ghi đè lại date_of_birth để dùng trong hệ thống
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    // Lấy user_id của user vừa tạo để tạo token
    // const user_id = result.insertedId.toString()

    // Ký ở đây
    //  Các tên cặp mã phải viết thường + "_" nha
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id.toString()),
      this.signRefreshToken(user_id.toString())
    ])

    //Thiếu hành động lưu mã rf vào database
    await databaseServices.refeshTokens.insertOne(
      new RefreshToken({
        // Muốn đưa lại cho server thì phải đưa về ObjectId chứ không để string như mình đã chuyển về
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    // tạo link và gữi qua email
    // xin video anh cho
    console.log(`http://localhost:3000/users/verify-email?email_verify_token=${email_verify_token}`)

    // return ra hai cái mã cho người dùng nữa nhé
    return {
      access_token, //
      refresh_token
    }
  }

  // Không return user về controller (vì sẽ bị lộ thông tin nha má đừng ngu ngục)
  async checkEmailExist(email: string) {
    const user = await databaseServices.users.findOne({ email })
    return Boolean(user)
  }

  //
  async checkRefeshToken({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    // Tìm rf dựa vào 2 thông tin
    const refeshToken = await databaseServices.refeshTokens.findOne({
      user_id: new ObjectId(user_id),
      token: refresh_token
    })

    // Nếu không có
    if (!refeshToken) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, // 401
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
      })
    }

    // Còn nếu có thì
    return true
  }

  //
  async logout({ refresh_token }: { refresh_token: string }) {
    // Xóa rf dựa vào token
    const result = await databaseServices.refeshTokens.deleteOne({ token: refresh_token })
    return result
  }

  //
  async checkEmailVerifyToken({
    user_id, //
    email_verify_token
  }: {
    user_id: string
    email_verify_token: string
  }) {
    // Tìm user từ các thông tin trên, nếu không có => là 2 thông tin
    // trên không khớp
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      // Trong database nó là _id: ObjectId
      email_verify_token
    })

    // Nếu không có
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, // 401
        message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_iNVALID
      })
    }
  }

  //
  async verifyEmail(user_id: string) {
    // Cập nhật trạng thái verify của user
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) },
      // Bỏ dô set
      [
        {
          $set: {
            verify: UserVerifyStatus.Verified, //1
            email_verify_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }

  // Lấy trạng thái verify
  async getVerifyStatus(user_id: string) {
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, // 401
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    return user.verify
    // Trả ra trạng thái verify cho người dùng, mình không được return user trực tiếp ra controller
  }

  // Resend verify email
  async resendVerifyEmail(user_id: string) {
    // Tạo email_verify_token từ user_id
    const email_verify_token = await this.signEmailVerifyToken(user_id)

    // Cập nhật lại emil_verify_token
    await databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token,
          updated_at: '$$NOW'
        }
      }
    ])

    // gửi lại link verify qua emial (Link này lấy trong register)
    console.log(`http://localhost:3000/users/verify-email?email_verify_token=${email_verify_token}`)
  }

  // Forgot password
  async forgotPassword(email: string) {
    // Tìm user từ email để lấy user_id
    const user = await databaseServices.users.findOne({ email })
    // Kỹ thuật dấu chấm than ngược
    const user_id = user!._id.toString()
    // Từ user_id mới tạo được mã forgot_password_token
    const forgot_password_token = await this.signForgotPasswordToken(user_id)

    // Cập nhật lại forgot_password_token vào user
    await databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])

    // Tạo link
    // 8000 là cổng của FE còn 3000 là cổng của BE

    console.log(`http://localhost:8000/users/reset-password?forgot_password_token=${forgot_password_token}`)
  }

  // Verify forgot password
  async checkForgotPasswordToken({
    user_id, //
    forgot_password_token
  }: {
    user_id: string
    forgot_password_token: string
  }) {
    // Với hai thông tin trên mình tìm user sở hữu cả hai
    // nếu có thì có nghĩa là mã token còn hiệu lực (hợp lệ)
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      forgot_password_token
    })

    // Nếu không có thì mình báo lỗi
    // và lỗi ở đây chỉ là 422 thôi nha
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY, // 422
        message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID
      })
    }

    // Còn nếu có thì mã hợp lệ thì thôi
  }

  // Reset password
  async resetPassword({
    user_id,
    password
  }: //
  {
    user_id: string
    password: string
  }) {
    // Mình sẽ tiếm hành cập nhật mật khẩu mới
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) }, // Tìm user cần cập nhật // Fliter
      [
        {
          $set: {
            password: hashPassword(password),
            forgot_password_token: '',
            // Mình phải đưa nó về chuỗi rỗng để tránh bị dùng lại
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }

  // Get user profile --- IGNORE ---
  async getMe(user_id: string) {
    const user = await databaseServices.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          // Phép select (Phép chiếu pi trong toán học )trong mongoDB
          password: 0, // 0: false (Không hiển thị trường dữ liệu này)
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )

    // Nếu không có user thì báo lỗi
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, // 401
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }

    // Nếu có thì mình trả về thông tin user
    return user
  }

  //Update user information
  async updateMe({ used_id, payload }: { used_id: string; payload: UpdateMeRequestBody }) {
    // Trong payload có date_of_birth thì mình phải chuyển nó về dạng Date
    const _payload = payload.date_of_birth //
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } //
      : payload

    // Nếu người dùng muốn update tên thì mình phải check trùng
    if (payload.username) {
      // Nếu dùng tên cũ thì mình vẫn phải báo lỗi nha
      const user = await databaseServices.users.findOne({
        username: payload.username
      })

      // Nếu có user thì báo lỗi
      if (user) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY, // 422
          message: USERS_MESSAGES.USERNAME_ALREADY_EXISTS
        })
      }
    }
    // Cập nhật thông tin
    // Mình không dùng hàm Update vì nó chỉ trả ra đối tượng Update và ai úpdtae không có thông tin cụ thể
    await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(used_id) }, //  Filter
      [
        {
          $set: {
            ..._payload,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after', // Trả về document sau khi update
        projection: {
          // Phép select (Phép chiếu pi trong toán học )trong mongoDB
          password: 0, // 0: false (Không hiển thị trường dữ liệu này)
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
  }

  // Change password
  async changePassword({
    user_id,
    old_password,
    password
  }: {
    user_id: string
    old_password: string
    password: string
  }) {
    // Dựa vào user_id và old_password xem có user nào không
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      password: hashPassword(old_password)
    })

    //Nếu không có thì nghĩa là người dùng nhập sai password
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, // 401
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }

    // Nếu tìm được thì nhập đúng pwd => tiến hành cho đổi mk
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) }, //
      [
        {
          $set: {
            password: hashPassword(password),
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }

  // Refesh Token
  async refeshToken({
    user_id,
    refresh_token //
  }: {
    user_id: string
    refresh_token: string
  }) {
    // Tạo ac và rf mới
    // T7 mình phải fix cái này phải trùng ngày hết hạn với ngày cũ nha
    const [access_token, refresh_token_new] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    // Xóa rf cũ
    await databaseServices.refeshTokens.deleteOne({ token: refresh_token })
    // Lưu rf mới vào database
    await databaseServices.refeshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token_new
      })
    )
    // Gữi lại ac và rf mới cho user
    return {
      access_token,
      refresh_token: refresh_token_new
    }
  }
}

const usersServices = new UsersServices()
export default usersServices
