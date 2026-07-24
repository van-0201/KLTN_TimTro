using System;

namespace TimTro_Backend.Models
{
    public class Appointment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid NguoiKhoiTaoId { get; set; }
        public Guid NguoiNhanHenId { get; set; }
        public Guid? RoomPostId { get; set; }
        public string LoaiLichHen { get; set; } // XemPhongTro / GapMatOGhep
        public DateTime ThoiGianHen { get; set; }
        public string DiaDiemHen { get; set; }
        public string? GhiChu { get; set; }
        public string TrangThaiLichHen { get; set; } = "ChoPhanHoi"; // ChoPhanHoi / DaXacNhan / DaHuy
        public Guid? PendingRescheduleById { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public DateTime NgayCapNhat { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User NguoiKhoiTao { get; set; }
        public User NguoiNhanHen { get; set; }
        public RoomPost RoomPost { get; set; }
    }
}
