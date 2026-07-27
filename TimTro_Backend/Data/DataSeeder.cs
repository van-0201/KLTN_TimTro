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

            context.SaveChanges();
        }
    }
}
