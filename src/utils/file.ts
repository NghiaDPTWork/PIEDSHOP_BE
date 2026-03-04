/*
  Mình sẽ viết hàm kiểm tra thư mục dự án kiểm tra xem có 
  folder uploads không nếu chưa có thì tạo
    - Thư viện fs: File System 
    - Tính năng: Tạo | Tìm | Thêm | thư mục
  
  cors config

  Client gửi ảnh -> BE lưu vào uploads -> Database lưu link
    => BE là người lưu hình thực sự
    => Database chỉ lưu đường dẫn

    - __dirname : Cung cấp đường dẫn đến thư mục chứa file
    - path : Cung cấp đường dẫn bắt đàu tính từ thư mục dự án
        Đang hướng về uploads dù uploads không tồn tại trong
        folder code của mình và đây là đường dẫn trong mơ mà
        mình muốn lưu trữ hình ảnh thư mục uploads nằm ở tầng 
        ngoài cùng của project mình chứ không nằm trong src

    console.log('Thu muc: ', __dirname)
    console.log(path.resolve('uploads'))
    
    Đối với hình ảnh BE cần thao tác 3 nhiệm vụ chính 
         - Tiếp nhận
         - Xử lý 
         - Nén
        
        Bước 1: Tiếp nhận
            - Tạo một tấm lưới lọc file bằng formidable
            - Phân biệt hài khái niệm field - file 
                field: là trường / vùng mà mình có thể tải các file lên
                file: đơn giản là những file mà user gửi lên cho mình thôi
            - Một bức hình: 
                Có 2 nội dung : 
                  - Ảnh 
                  - Nội dung
                  => Nên khi gửi cái nào dư kb thì có thể qua về mặt hình ảnh nhưng nội dung ko đủ (match data)
                  - Muốn chặn bug => wrapAsyn

        filter: ({ name, originalFilename, mimetype }) => {}
        - name : Trường dữ liệu được gửi từ form
        - originalFilename: tên gốc của file
        - mimeType: loại file của type

*/

import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'

export const initFolder = () => {
  // Tận dụng foreach thay vì lặp lại logic 2 lần
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

export const handleUploadSingleImage = (
  // Tiếp nhận file từ request - kiểm tra và lưu tạm
  req: Request
) => {
  const form = formidable({
    maxFiles: 1, // tối đa 1 file
    maxFileSize: 1024 * 300, // 300kb kích thước tối đa
    keepExtensions: true,
    uploadDir: path.resolve(UPLOAD_IMAGE_TEMP_DIR), // Muốn lưu file ở đâu
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File không hợp lệ') as any)
      }
      return valid
    }
  })

  // Tạo ra rồi giờ xài
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      //xử lý fields hoặc files
      //ko đc đóng gòi res ở đây => controller
      //nếu không có lỗi trong quá trình parse
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      //nếu mà có gửi và đầy đủ thì
      return resolve(files.image[0] as File)
    })
  })
}

export const getNameFormFileName = (fileName: string) => {
  const nameArr = fileName.split('.')
  nameArr.pop()
  return nameArr.join('.')
}

export const getExtFormFileName = (fileName: string) => {
  const nameArr = fileName.split('.')
  return nameArr.pop()
}
