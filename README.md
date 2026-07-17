# Dự án Quản lý Phòng trọ (KLTN_TimTro)

Dự án này bao gồm 2 phần chính: **Backend** (ASP.NET Core Web API) và **Frontend** (ReactJS + Vite). Dưới đây là hướng dẫn chi tiết để thiết lập và chạy dự án trên môi trường Local (máy cá nhân).

## 🛠 Yêu cầu hệ thống (Prerequisites)
Trước khi bắt đầu, máy tính của bạn cần cài đặt sẵn các phần mềm sau:
1. **[Node.js](https://nodejs.org/en/)** (Phiên bản 18+ để chạy Frontend).
2. **[.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)** (Hoặc phiên bản .NET tương ứng với dự án để chạy Backend).
3. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Dùng để chạy Database MySQL nhanh chóng mà không cần cài đặt rườm rà).

---

## 🗄️ Thiết lập Cơ sở dữ liệu (Database) bằng Docker
Để hệ thống có nơi lưu trữ dữ liệu, chúng ta sẽ bật MySQL thông qua Docker:
1. Đảm bảo phần mềm Docker Desktop đang mở.
2. Tại thư mục gốc của dự án, mở Terminal/CMD và chạy:
   ```bash
   docker-compose up -d
   ```
*(Lệnh này sẽ tự động tải MySQL về và khởi chạy ở cổng `3307` với tài khoản `root` và mật khẩu `admin_password_123`).*

---

## ⚙️ Hướng dẫn cài đặt Backend (ASP.NET Core)

1. Di chuyển vào thư mục Backend:
   ```bash
   cd TimTro_Backend
   ```

2. Cấu hình các biến môi trường:
   - Tạo một bản sao của file `appsettings.example.json` và đổi tên thành `appsettings.json`.
   - Mở file `appsettings.json` vừa tạo và điền các thông tin bảo mật của bạn:
     - **Database:** Chuỗi kết nối mặc định đã cấu hình sẵn cổng 3307 và mật khẩu để khớp với Docker Compose ở trên. Bạn không cần đổi nếu dùng Docker.
     - **Cloudinary:** Thay thế các thông số `CloudName`, `ApiKey`, `ApiSecret` bằng thông tin lấy từ tài khoản Cloudinary của bạn (Dùng để lưu trữ ảnh/minh chứng).
     - **JWT:** Thay thế đoạn `Key` bằng một chuỗi ngẫu nhiên, bí mật và đủ dài (ít nhất 16 ký tự).
     - **EmailSettings:** Nhập địa chỉ Gmail của bạn vào `SenderEmail` và điền [Mật khẩu ứng dụng (App Password)](https://myaccount.google.com/apppasswords) vào `Password` để hệ thống tự động gửi email thông báo tới người dùng.

3. Chạy lệnh cập nhật Database (Migrations):
   ```bash
   dotnet ef database update
   ```
   *(Lệnh này sẽ tự động tạo cơ sở dữ liệu `timtro_db` và các bảng tương ứng trong container MySQL).*

4. Chạy server Backend:
   ```bash
   dotnet run
   ```

---

## 💻 Hướng dẫn cài đặt Frontend (React + Vite)

1. Mở một terminal mới (Giữ nguyên terminal Backend đang chạy) và di chuyển vào thư mục Frontend:
   ```bash
   cd TimTro_Frontend
   ```

2. Cài đặt các thư viện phụ thuộc:
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
Bây giờ cả Database, Backend và Frontend đều đã hoạt động. Bạn có thể tạo tài khoản, đăng nhập và trải nghiệm dự án!
