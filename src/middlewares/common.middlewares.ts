import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

/*
    LƯU Ý KỸ NỘI DUNG Ở ĐÂY
    filterKey: Là "mảng chứa chuỗi" tên của các key
        Hàm này sẽ trả ra 1 cái middleware với chức năng
        Sàn lọc lại những dữ liệu mà mình yêu cầu thoi nếu dư -> bỏ 
    
    Vậy làm sao biết user gửi dư ?
        Thì mình dựa trên RequestBody (Thứ mình cần) và so với
        Dữ liệu từ fe gửi xuống (thứ user đưa)
        Trong lodash Omit: loại bỏ - Pick: giữ lại
    
    
    Nếu mình định nghĩa là string[] => nhưng gõ nó không suggestcode nào hết
        Mình sử dụng tối đa kiến thức của Generic -> 
        Truyền vào 1 Mảng T có chứa các key của T 
*/

export const filterMiddleware = <T>(filterKeys: Array<keyof T>) => {
  //               không còn là filterKeys: string[] => Ứng dụng mạnh generic
  return (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }
}

// TypeScript cần chú trọng
// HandBook TypeScript
