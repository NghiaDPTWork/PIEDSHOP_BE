import { NextFunction, Request, Response } from 'express'
import formidable from 'formidable'
import { result } from 'lodash'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'
import mediasService from '~/services/medias.services'
import { handleUploadSingleImage } from '~/utils/file'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'

export const uploadSingleImageController = async (
  req: Request, //
  res: Response,
  next: NextFunction
) => {
  const file = await mediasService.uploadSingleImage(req)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Upload image successfully',
    result: file
  })
}

export const serveSingleImageController = async (
  req: Request, //
  res: Response
) => {
  // Mình sẽ lấy cái file của người dùng gửi cho mình
  const { filename } = req.params

  // Mình gửi cho người dùng cái file
  return res.sendFile(
    path.resolve(UPLOAD_IMAGE_DIR, filename), //
    (err) => {
      if (!err) {
        return res.status((err as any).status || 500).json({
          message: 'File not found'
        })
      }
    }
  )
}
