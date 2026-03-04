import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { REGEX_USERNAME } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 8,
      max: 50
    },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
      // returnScore: false
      // false : chỉ return true nếu password mạnh, false nếu k
      // true : return về chất lượng password(trên thang điểm 10)
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 8,
      max: 50
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return true
    }
  }
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_BE_ISO8601
  }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
    ////messages.ts thêm IMAGE_URL_MUST_BE_A_STRING: 'Image url must be a string'
  },
  trim: true, //nên đặt trim dưới này thay vì ở đầu
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_LESS_THAN_400
    //messages.ts thêm IMAGE_URL_LENGTH_MUST_BE_LESS_THAN_400: 'Image url length must be less than 400'
  }
}

// Kiểm tra dữ liệu có đủ và sạch hay không

// export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
//   const { email, password } = req.body
//   if (!email || !password) {
//     return res.status(400).json({ message: 'Missing email or password' })
//   }
//   next()
// }

// Login
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true
      },
      password: passwordSchema
    },
    ['body']
  )
)

// Validate đi với checkSchema mới đạt toàn bộ hiệu năng
// export const registerValidator = validate(
//   checkSchema(
//     {
//       // Name
//       name: {
//         notEmpty: {

//         },
//         isString: true,
//         trim: true,
//         isLength: {
//           options: {
//             min: 1,
//             max: 100
//           }
//         }
//       },
//       // Email
//       email: {
//         notEmpty: true,
//         isEmail: true,
//         trim: true
//       },
//       // Password
//       password: {
//         notEmpty: true,
//         isString: true,
//         isLength: {
//           options: {
//             min: 8,
//             max: 50
//           }
//         },

//         isStrongPassword: {
//           options: {
//             minLength: 8,
//             minLowercase: 1,
//             minUppercase: 1,
//             minNumbers: 1,
//             minSymbols: 1
//             // returnScore: false
//             // false : chỉ return true nếu password mạnh, false nếu k
//             // true : return về chất lượng password(trên thang điểm 10)
//           }
//         },
//         errorMessage:
//           'Password mus be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
//       },
//       // Confirm Password
//       confirm_password: {
//         notEmpty: true,
//         isString: true,
//         isLength: {
//           options: {
//             min: 8,
//             max: 50
//           }
//         },
//         isStrongPassword: {
//           options: {
//             minLength: 8,
//             minLowercase: 1,
//             minUppercase: 1,
//             minNumbers: 1,
//             minSymbols: 1
//           },
//           errorMessage:
//             'Password mus be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
//         },

//         // Xử lý check pwd có khớp với confirm pwd

//         custom: {
//           options: (value, { req }) => {
//             // value là trường dữ liệu đang có : confirm_password
//             if (value !== req.body.password) {
//               // Lúc này các dữ liệu được lưu trong request nha
//               // Chui vào body và lấy nha

//               // throw new Error('Confirm password does not match password')
//               // Khúc này chuyển về Lỗi đã được custom
//               // throw new ErrorWithStatus({
//               //   status: HTTP_STATUS.UNPROCESSABLE_ENTITY, // 422
//               //   message: 'Confirm password does not match password'
//               // })

//               // Việc trở về bản này thì xminhf sẽ thấy rằng là bản chất
//               // mình hiểu rằng ở đay sẽ quăng ra lỗi 422 nên hi mình quăng ra
//               // thì mình không cần custom nữa (Chỉ riêng ở đay thôi nhé !!!)
//               throw new Error('Confirm password does not match password')
//             } else {
//               return true
//             }
//           }
//         }
//       },
//       // Date of birth
//       date_of_birth: {
//         isISO8601: {
//           options: {
//             strict: true,
//             strictSeparator: true
//           }
//         }
//       }
//     },
//     ['body']
//   )
// )

// Register
export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

// AccessToken
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            // Trong đó value là Authorization: 'Bearer access_token'
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED, // 401
                // Vì sao ở đây lại đánh mã 401 vậy ?
                // Việc người dùng gửi thiếu cả bộ thì mình có thể đẩy thành lỗi 422
                // Nhưng việc cố tính gửi thiếu một nữa chuỗi thì là do user cố tình tấn công
                // vào hệ thống nên mình cần cảnh cáo user này
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
              })
            }
            // Nếu có access_token thì mình tiến hành verify privateKey của mình
            // Xác minh xem cái mã đó hợp lệ hay không
            try {
              // Vì bên kia mình có throw error nên là nếu để nó đụng checkSchema thì nó sẽ thành lỗi 422
              // Nhưng bản chất lỗi này không phải 422 nên ta phải chụp và cấu hình alij nó
              //
              const decoded_authorization = await verifyToken({
                token: access_token, //Khúc sau là mới thêm vào nha
                privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              // Mình cần phải kiểm tra id_user ở database
              // Nhưng đây không phải tầng để kiếm tra nên bắt buộc mình phải lưu nó vào req
              // Và đưa nó qua bên controller để kiểm tra nha
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED, // 401
                message: capitalize((error as JsonWebTokenError).message)
              })
            }
            // Nhớ phải retturn nha
            return true
          }
        }
      }
    },
    ['headers']
  )
)

// RefreshToken
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            // Trong đó value là refresh_token

            if (!value) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED, // 401
                // Vì sao ở đây lại đánh mã 401 vậy ?
                // Việc người dùng gửi thiếu cả bộ thì mình có thể đẩy thành lỗi 422
                // Nhưng việc cố tính gửi thiếu một nữa chuỗi thì là do user cố tình tấn công
                // vào hệ thống nên mình cần cảnh cáo user này
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
              })
            }
            // Nếu có refresh_token thì mình tiến hành verify privateKey của mình
            // Xác minh xem cái mã đó hợp lệ hay không
            try {
              // Vì bên kia mình có throw error nên là nếu để nó đụng checkSchema thì nó sẽ thành lỗi 422
              // Nhưng bản chất lỗi này không phải 422 nên ta phải chụp và cấu hình alij nó
              //
              const decoded_refresh_token = await verifyToken({
                token: value, //Khúc sau là mới thêm vào nha
                privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
              })
              // Mình cần phải kiểm tra id_user ở database
              // Nhưng đây không phải tầng để kiếm tra nên bắt buộc mình phải lưu nó vào req
              // Và đưa nó qua bên controller để kiểm tra nha
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
              // phải có dấu ; để tránh máy tính hiểu nhàm thành kỹ thuậtn củrying
            } catch (error) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED, // 401
                message: capitalize((error as JsonWebTokenError).message)
              })
            }
            // Nhớ phải retturn nha
            return true
          }
        }
      }
    },
    ['body']
  )
)

// Email Verify
export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED
        },

        // Nếu có thì mình phải verify
        custom: {
          options: async (value: string, { req }) => {
            // Trong đó value là email_verify_token
            try {
              const decoded_email_verify_token = await verifyToken({
                // Email Verify Token
                token: value,
                privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })

              // mình cần định nghĩa để chấm nó xổ ra thuộc tính
              // và lưu vào request để qua controller gọi ra dùng đc nha
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token

              //
            } catch (error) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED, // 401
                message: capitalize((error as JsonWebTokenError).message)
              })
            }

            // Nhớ phải retturn nha
            return true // passed validator
          }
        }
      }
    },
    ['query']
  )
)

// Forgot Password
export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true
      }
    },
    ['body']
  )
)

// Verify Forgot Password
export const forgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        // Mình phải luôn trim để tạo thế phòng bị cho mình nha
        trim: true,
        notEmpty: {
          errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
        },

        // Nếu có thì mình phải verify
        custom: {
          options: async (value: string, { req }) => {
            // Trong đó value là forgot_password_token
            try {
              const decoded_fogot_password_token = await verifyToken({
                // Email Verify Token
                token: value,
                privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })

              // mình cần định nghĩa để chấm nó xổ ra thuộc tính
              ;(req as Request).decoded_fogot_password_token = decoded_fogot_password_token
            } catch (error) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED, // 401
                message: capitalize((error as JsonWebTokenError).message)
              })
            }

            // Nhớ phải retturn nha
            return true // passed validator
          }
        }
      }
    },
    ['body']
  )
)

// Reset Password
export const resetPasswordValidator = validate(
  checkSchema(
    // Chỉ cần kiểm tra password và confirm_password thôi
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

// Update Me
/*
  Vấn đề lớn nhất hiện tại của Middle ware chính là mình có thể kiểm 
  tra và validate khi người dùng gửi thiếu thông (đủ và đúng) tin nhưng mình chưa 
  chuẩn bị kịch bản cho việc người dùng gửi dư thông tin(filterMiddleware) lên 
  nên đó là một điều vô cùng tai hại vì như vậy hệ thông của mình rất dễ
  sẽ bị hack = role khi hacker cố tình truyền trong bio nhé !!!
    => chính vì vậy mình phải CHẶN được điều đó
*/
export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        optional: true, //đc phép có hoặc k
        ...nameSchema, //phân rã nameSchema ra
        notEmpty: undefined //ghi đè lên notEmpty của nameSchema
      },
      date_of_birth: {
        optional: true, //đc phép có hoặc k
        ...dateOfBirthSchema, //phân rã nameSchema ra
        notEmpty: undefined //ghi đè lên notEmpty của nameSchema
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.BIO_MUST_BE_A_STRING ////messages.ts thêm BIO_MUST_BE_A_STRING: 'Bio must be a string'
        },
        trim: true, //trim phát đặt cuối, nếu k thì nó sẽ lỗi validatior
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USERS_MESSAGES.BIO_LENGTH_MUST_BE_LESS_THAN_200 //messages.ts thêm BIO_LENGTH_MUST_BE_LESS_THAN_200: 'Bio length must be less than 200'
        }
      },
      //giống bio
      location: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_A_STRING ////messages.ts thêm LOCATION_MUST_BE_A_STRING: 'Location must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_LESS_THAN_200 //messages.ts thêm LOCATION_LENGTH_MUST_BE_LESS_THAN_200: 'Location length must be less than 200'
        }
      },
      //giống location
      website: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_A_STRING ////messages.ts thêm WEBSITE_MUST_BE_A_STRING: 'Website must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },

          errorMessage: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_LESS_THAN_200 //messages.ts thêm WEBSITE_LENGTH_MUST_BE_LESS_THAN_200: 'Website length must be less than 200'
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_A_STRING ////messages.ts thêm USERNAME_MUST_BE_A_STRING: 'Username must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: USERS_MESSAGES.USERNAME_LENGTH_MUST_BE_LESS_THAN_50 //messages.ts thêm USERNAME_LENGTH_MUST_BE_LESS_THAN_50: 'Username length must be less than 50'
        },
        custom: {
          options: async (value: string, { req }) => {
            // Mình đã có regex để chặn việc nhập các ký tự trong
            // constant (Không có ký tự đặc biệt - không trung - không có dấu cách)
            // Nếu xài match => Thì mình phải vaule.match(REGEX_USERNAME)

            if (!REGEX_USERNAME.test(value)) {
              throw new Error(USERS_MESSAGES.USERNAME_IS_INVALID)
            }
            // passed validator
            return true
          }
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)

//
export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: passwordSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)
