import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controller'
import { wrapAsync } from '~/utils/handler'

const mediaRouter = Router()

/*
    - Chức năng: UploadImg
       des: Người dùng up load hình ảnh lên
       method: Post
       body : {
       
       }
*/

// Upload Image
mediaRouter.post(
  '/upload-image', //
  wrapAsync(uploadSingleImageController)
)
export default mediaRouter
