using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using TimTro_Backend.Models;

namespace TimTro_Backend.Data
{
    public static class DataSeeder
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.Migrate(); // Ensures all migrations are applied

            if (!context.Users.Any(u => u.VaiTro == "Admin"))
            {
                context.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
                    HoTen = "Quản trị viên Hệ thống",
                    Email = "admin@phongtro.vn",
                    SoDienThoai = "0123456789",
                    MatKhauBam = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    VaiTro = "Admin",
                    TrangThaiTaiKhoan = true,
                    NgayTao = DateTime.Now
                });
            }

            if (!context.Users.Any(u => u.VaiTro == "Moderator"))
            {
                context.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
                    HoTen = "Kiểm duyệt viên",
                    Email = "mod@phongtro.vn",
                    SoDienThoai = "0987654321",
                    MatKhauBam = BCrypt.Net.BCrypt.HashPassword("Mod@123"),
                    VaiTro = "Moderator",
                    TrangThaiTaiKhoan = true,
                    NgayTao = DateTime.Now
                });
            }

            if (!context.Users.Any(u => u.Email == "chutro@phongtro.vn"))
            {
                context.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
                    HoTen = "Nguyễn Chủ Trọ",
                    Email = "chutro@phongtro.vn",
                    SoDienThoai = "0333444555",
                    MatKhauBam = BCrypt.Net.BCrypt.HashPassword("ChuTro@123"),
                    VaiTro = "ChuTro",
                    TrangThaiTaiKhoan = true,
                    NgayTao = DateTime.Now
                });
            }

            if (!context.Users.Any(u => u.Email == "nguoithue@phongtro.vn"))
            {
                context.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
                    HoTen = "Trần Người Thuê",
                    Email = "nguoithue@phongtro.vn",
                    SoDienThoai = "0666777888",
                    MatKhauBam = BCrypt.Net.BCrypt.HashPassword("NguoiThue@123"),
                    VaiTro = "NguoiThue",
                    TrangThaiTaiKhoan = true,
                    NgayTao = DateTime.Now
                });
            }

            if (!context.Users.Any(u => u.Email == "thuetro1@phongtro.vn"))
            {
                context.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
                    HoTen = "Lê Thuê Trọ 1",
                    Email = "thuetro1@phongtro.vn",
                    SoDienThoai = "0111222333",
                    MatKhauBam = BCrypt.Net.BCrypt.HashPassword("ThueTro1@123"),
                    VaiTro = "NguoiThue",
                    TrangThaiTaiKhoan = true,
                    NgayTao = DateTime.Now
                });
            }

            if (!context.Users.Any(u => u.Email == "thuetro2@phongtro.vn"))
            {
                context.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
                    HoTen = "Phạm Thuê Trọ 2",
                    Email = "thuetro2@phongtro.vn",
                    SoDienThoai = "0444555666",
                    MatKhauBam = BCrypt.Net.BCrypt.HashPassword("ThueTro2@123"),
                    VaiTro = "NguoiThue",
                    TrangThaiTaiKhoan = true,
                    NgayTao = DateTime.Now
                });
            }

            context.SaveChanges();
        }
    }
}
