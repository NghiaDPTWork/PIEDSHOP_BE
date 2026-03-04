import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (
  err: any, //
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // không phải lỗi nào cũng có status đâu nên là để thêm trường hợp 500
  // Error Handler tổng nhận tất cả lỗi từ hệ thống có 2 loại chính :
  // Lỗi từ ErrorWithStatus thì làm như này
  if (err instanceof ErrorWithStatus) {
    return res
      .status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR) // 500
      .json(omit(err, ['status']))
  }

  // Kỹ thuật lượt bỏ đi bớt
  // 1. Omit
  // 2. Thư viện Lodash - Vẫn dùng omit (Nhưng dễ dùng hơn)

  // Lỗi mình không biết
  // Không dùng for-in vì enumerable false là ko có khả lặp
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, {
      enumerable: true
    })
  })
  return res
    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR) // 500
    .json(omit(err, ['stack']))
}
