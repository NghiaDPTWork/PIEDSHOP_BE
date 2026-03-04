import e from 'express'
import HTTP_STATUS from '~/constants/httpStatus'

//
type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

// Định nghĩa loại lỗi mới do mình tạo ra nha
export class ErrorWithStatus {
  status: number
  message: string

  // Truyền vào object có 3 lợi ích sau
  //    1. Không cần thoe thứ tự
  //    2. Đảm bảo tính liên kết trong kết
  //    3. Đảm bảo được default value
  //    Nhưng không phải lúc nào mình cũng cần truyền vào object đâu nhé
  //    Dùng để phân loại và message có thể thấy được
  //    Trong một hệ thống lớn việc gom + quy lỗi về 1 nơi để xử lý là vô cùng quan trọng

  constructor({ status, message }: { status: number; message: string }) {
    this.status = status
    this.message = message
  }
}

// Tạo class này để cấu trúc lỗi báo về nó sẽ có cấu trúc tường minh
// và dễ đọc
export class EntityError extends ErrorWithStatus {
  errors: ErrorType

  constructor({
    message = 'Validation Error', //
    errors
  }: {
    message?: string
    errors: ErrorType
  }) {
    super({ status: HTTP_STATUS.UNPROCESSABLE_ENTITY, message }) // 422
    this.errors = errors
  }
}
