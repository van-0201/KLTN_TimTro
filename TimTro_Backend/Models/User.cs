using System;
using System.Collections.Generic;

namespace TimTro_Backend.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string HoTen { get; set; }
        public string Email { get; set; }
        public string SoDienThoai { get; set; }
        public string MatKhauBam { get; set; }
        public string VaiTro { get; set; } // NguoiThue, ChuTro, Moderator, Admin
        public bool TrangThaiTaiKhoan { get; set; } = true;
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public DateTime? NgayHetHanDichVu { get; set; }
        public DateTime? NgayDangTimOGhepGanNhat { get; set; }

        // Navigation properties
        public RoommateProfile RoommateProfile { get; set; }
        public ICollection<RoomPost> RoomPosts { get; set; }
        public ICollection<Appointment> CreatedAppointments { get; set; }
        public ICollection<Appointment> ReceivedAppointments { get; set; }
        public ICollection<Report> SentReports { get; set; }
        public ICollection<Report> ReceivedReports { get; set; }
        public ICollection<Report> ProcessedReports { get; set; }
        public ICollection<Transaction> Transactions { get; set; }
        public ICollection<Transaction> ProcessedTransactions { get; set; }
        public ICollection<MatchRequest> SentMatchRequests { get; set; }
        public ICollection<MatchRequest> ReceivedMatchRequests { get; set; }
        public ICollection<Notification> Notifications { get; set; }
    }
}
