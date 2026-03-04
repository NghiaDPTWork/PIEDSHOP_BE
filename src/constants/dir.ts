import path from 'path'

/* 

    Lưu trữ các đường dẫn ở đây

    1. Formidable:
        - Tiếp nhận file từ req
        - Kiểm tra xem file này là gì ?
        - File này đúng dung lượng không ?

    Các cấp của File 
    UPLOADS
        IMAGE
            TEMP (dô đây trước -> Sharp, nén "xóa ndung thừa" -> rồi mới lên Image -> Tạo ra url serving lưu lên db)
        VIDEO
            Video không có temp -> Không nén được
                                -> không bóp méo = code đc

    

*/

export const UPLOAD_IMAGE_TEMP_DIR = path.resolve('uploads/image/temp')
export const UPLOAD_IMAGE_DIR = path.resolve('uploads/image')
export const UPLOAD_VIDEO_DIR = path.resolve('uploads/video')
