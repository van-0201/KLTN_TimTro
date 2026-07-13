using System;

namespace TimTro_Backend.Models
{
    public class Report
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid NguoiGuiId { get; set; }
        public Guid? BaiDangBiBaoCaoId { get; set; }
        public Guid? TaiKhoanBiBaoCaoId { get; set; }
        public string LyDoPhanAnh { get; set; }
        public string DuongDanMinhChung { get; set; } = "[]"; // JSON Array of Cloudinary image URLs
        public string TrangThaiXuLy { get; set; } = "ChoXuLy"; // ChoXuLy / DaXuLy / BacBo
        public Guid? NguoiKiemDuyetXuLyId { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User NguoiGui { get; set; }
        public RoomPost BaiDangBiBaoCao { get; set; }
        public User TaiKhoanBiBaoCao { get; set; }
        public User NguoiKiemDuyetXuLy { get; set; }
    }
}
