// Hàm mã hóa 1 nội dung bất kỳ theo chuẩn SHA256 + digest hex

import { createHash } from 'crypto'

// Hàm này mã hóa nội dung
function sha256(content: string) {
  // Tiến hành mã hóa nội dung
  return createHash('sha256').update(content).digest('hex')
}

// Hàm này dùng để mã hóa pwd nha
export function hashPassword(password: string) {
  // Việc lưu pass + một bí mật => Tăng tính bảo mật

  return sha256(password + process.env.PASSWORD_SECRET)
}
