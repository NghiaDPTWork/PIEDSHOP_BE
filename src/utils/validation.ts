import { NextFunction, Request, Response } from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    // errorsObject sẽ được xử lý riêng trong tương lai
    const errorsObject = errors.mapped()
    //
    const entityError = new EntityError({ errors: {} })

    //
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (
        msg instanceof ErrorWithStatus && //
        msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY
      ) {
        return next(msg)
      }
      entityError.errors[key] = msg
    }

    return next(entityError)

    // return res.status(400).json({
    // return res
    //   .status(HTTP_STATUS.UNPROCESSABLE_ENTITY) // 422
    //   .json({
    //     // message: 'Validatidon Failed',
    //     errors: errorsObject
    //   })
  }
}
