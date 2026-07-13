using System;

namespace TimTro_Backend.Models
{
    public class Notification
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid MaNguoiDung { get; set; }
        public string NoiDung { get; set; }
        public bool DaDoc { get; set; } = false;
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User NguoiDung { get; set; }
    }
}
