# Dự án Quản lý Phòng trọ (KLTN_TimTro)

Dự án này bao gồm 2 phần chính: **Backend** (ASP.NET Core Web API) và **Frontend** (ReactJS + Vite). Dưới đây là hướng dẫn chi tiết để thiết lập và chạy dự án trên môi trường Local (máy cá nhân).

## 🛠 Yêu cầu hệ thống (Prerequisites)
Trước khi bắt đầu, máy tính của bạn cần cài đặt sẵn các phần mềm sau:
1. **[Node.js](https://nodejs.org/en/)** (Phiên bản 18+ để chạy Frontend).
2. **[.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)** (Hoặc phiên bản .NET tương ứng với dự án để chạy Backend).
3. **[MySQL Server](https://dev.mysql.com/downloads/installer/)** (Hệ quản trị cơ sở dữ liệu).

---

## ⚙️ Hướng dẫn cài đặt Backend (ASP.NET Core)

1. Di chuyển vào thư mục Backend:
   ```bash
   cd TimTro_Backend
   ```

2. Cấu hình các biến môi trường và Database:
   - Trong thư mục Backend, tìm file `appsettings.example.json`.
   - Tạo một bản sao của file này và đổi tên thành `appsettings.json`.
   - Mở file `appsettings.json` vừa tạo và điền các thông tin bảo mật của bạn:
     - **Database:** Điền mật khẩu MySQL của máy bạn vào chuỗi `ConnectionStrings:DefaultConnection`. Đảm bảo port và username khớp với máy tính của bạn (Mặc định thường là port 3306, user `root`).
     - **Cloudinary:** Thay thế các thông số `CloudName`, `ApiKey`, `ApiSecret` bằng thông tin lấy từ tài khoản Cloudinary của bạn (Dùng để upload ảnh).
     - **JWT:** Thay thế đoạn `Key` bằng một chuỗi ngẫu nhiên, bí mật và đủ dài (ít nhất 16 ký tự).

3. Chạy lệnh cập nhật Database (Migrations):
   ```bash
   dotnet ef database update
   ```
   *(Lệnh này sẽ tự động tạo cơ sở dữ liệu `timtro_db` và các bảng tương ứng trong MySQL của bạn).*

4. Chạy server Backend:
   ```bash
   dotnet run
   ```
   Backend của bạn sẽ khởi chạy (Thông thường ở địa chỉ `http://localhost:5000` hoặc tuỳ thuộc vào file `launchSettings.json`).

---

## 💻 Hướng dẫn cài đặt Frontend (React + Vite)

1. Mở một terminal mới (Giữ nguyên terminal Backend đang chạy) và di chuyển vào thư mục Frontend:
   ```bash
   cd TimTro_Frontend
   ```

2. Cài đặt các thư viện phụ thuộc (Dependencies):
   ```bash
   npm install
   ```

3. Khởi chạy giao diện Frontend:
   ```bash
   npm run dev
   ```

4. Truy cập trang web:
   Mở trình duyệt và truy cập vào đường dẫn được cung cấp trong terminal (thường là `http://localhost:5173`).

---

## 🚀 Hoàn thành
Bây giờ cả Frontend và Backend đều đã được liên kết với nhau. Bạn có thể tạo tài khoản, đăng nhập và trải nghiệm toàn bộ tính năng của dự án!
