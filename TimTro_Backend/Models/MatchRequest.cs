using System;

namespace TimTro_Backend.Models
{
    public class MatchRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid NguoiGuiId { get; set; }   // FK -> TaiKhoan (UserId)
        public Guid NguoiNhanId { get; set; }   // FK -> TaiKhoan (UserId)
        public string TrangThai { get; set; } = "ChoXacNhan"; // ChoXacNhan / DaDongY / TuChoi
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User NguoiGui { get; set; }
        public User NguoiNhan { get; set; }
    }
}
