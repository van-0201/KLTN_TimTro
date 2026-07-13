using System;

namespace TimTro_Backend.DTOs
{
    public class CreateAppointmentRequest
    {
        public Guid NguoiNhanHenId { get; set; }
        public Guid? RoomPostId { get; set; }
        public string LoaiLichHen { get; set; } = string.Empty; // XemPhongTro / GapMatOGhep
        public DateTime ThoiGianHen { get; set; }
        public string DiaDiemHen { get; set; } = string.Empty;
        public string? GhiChu { get; set; }
    }

    public class AppointmentResponse
    {
        public Guid Id { get; set; }
        public Guid NguoiKhoiTaoId { get; set; }
        public string NguoiKhoiTaoTen { get; set; } = string.Empty;
        public string NguoiKhoiTaoPhone { get; set; } = string.Empty;
        public Guid NguoiNhanHenId { get; set; }
        public string NguoiNhanHenTen { get; set; } = string.Empty;
        public string NguoiNhanHenPhone { get; set; } = string.Empty;
        public Guid? RoomPostId { get; set; }
        public string RoomPostTitle { get; set; } = string.Empty;
        public string LoaiLichHen { get; set; } = string.Empty;
        public DateTime ThoiGianHen { get; set; }
        public string DiaDiemHen { get; set; } = string.Empty;
        public string? GhiChu { get; set; }
        public string TrangThaiLichHen { get; set; } = string.Empty;
        public Guid? PendingRescheduleById { get; set; }
    }
}
