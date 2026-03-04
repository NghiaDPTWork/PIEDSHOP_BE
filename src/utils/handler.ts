// Hàm nhận vao RequestHandler: (req, res, next) => {}
//  và biến nó thành 1 RequestHandler khác

import { NextFunction, Request, RequestHandler, Response } from 'express'

// có cấu trúc try catch next
// export const wrapAsync = (func: RequestHandler) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await func(req, res, next)
//     } catch (error) {
//       next(error)
//     }
//   }
// }

// Kỹ thuật generic - Tránh conflig khi tái định nghĩa
export const wrapAsync = <P, T>(func: RequestHandler<P, any, any, T>) => {
  return async (req: Request<P, any, any, T>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
