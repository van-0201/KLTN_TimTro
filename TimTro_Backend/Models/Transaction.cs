using System;

namespace TimTro_Backend.Models
{
    public class Transaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid NguoiDungId { get; set; }
        public string LoaiGoi { get; set; } // Goi7Ngay, Goi30Ngay, Goi365Ngay
        public decimal SoTien { get; set; }
        public string NoiDungChuyenKhoan { get; set; }
        public string MaQR { get; set; }
        public string TrangThai { get; set; } = "ChoDuyet"; // ChoDuyet / ThanhCong / TuChoi / DaHuy
        public Guid? NguoiDuyetId { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public DateTime? NgayDuyet { get; set; }

        // Navigation properties
        public User NguoiDung { get; set; }
        public User NguoiDuyet { get; set; }
    }
}
