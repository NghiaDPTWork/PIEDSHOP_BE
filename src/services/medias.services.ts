import { Request } from 'express'
import { String } from 'lodash'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFormFileName, handleUploadSingleImage } from '~/utils/file'
import fs from 'fs'

class MediasService {
  //
  async uploadSingleImage(req: Request) {
    //
    const file = await handleUploadSingleImage(req)
    file.newFilename = getNameFormFileName(file.newFilename) + '.jpg'
    // Tạo đường dẫn mà mình sẽ lưu file
    const newPath = UPLOAD_IMAGE_DIR + '/' + file.newFilename

    // sharp | file.filepath: Là đường dẫn lưu trữ trong temp
    await sharp(file.filepath as string)
      .jpeg()
      .toFile(newPath)

    // Lưu Foler vào newPath

    // Xóa file cũ đi
    fs.unlinkSync(file.filepath)

    // Trả ra link để người dùng xài
    return `http://localhost:3000/static/image/${file.newFilename}`
  }
}

// Dependency inject
const mediasService = new MediasService()
export default mediasService
