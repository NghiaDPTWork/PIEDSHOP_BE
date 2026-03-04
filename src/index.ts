/*
    Lỗi thường được anh chai thành 3 loại nha
    1. 422: Lỗi về dữ liệu (không nghiêm trọng không snhr hưởng đến bảo mật) - 70%
    2. 300 - 499 : Lỗi đặc biệt (Hầu hết là do mình tự tạo ra)
    3. 500 : Do quá trình mình code tự phát sinh trong quá trình mình run mà hệ thống chụp được 
             Lỗi mà hệ thống không biết

    Coi ngày tháng năm sinh
    let date = new Date(2005, 11, 22)
    console.log(date)
  
*/

import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import userRouter from './routes/users.routers'
import databaseServices from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediaRouter from './routes/medias.routers'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routes'

// Khởi tạo server
const app = express()

// Mở cổng backend với PORT
const PORT = 3000
databaseServices.connect()

// Tạo thư mục Uploads tự động để lưu ảnh
initFolder()

// Chuyển đổi json thành obj
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Những đường dẫn liên quan đến User
app.use('/users', userRouter)

// Những đường dẫn liên quan đến media
app.use('/medias', mediaRouter)

//
app.use('/static', staticRouter)

// Liên quan đên video mình học loading Chunk_Sides

// Hệ thống ErrorHandler tổng dùng =>  xử lý lỗi nên cần đặt xuống cuối
app.use(defaultErrorHandler)

// Cho server mở cổng lắng nghe sự kiện
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
