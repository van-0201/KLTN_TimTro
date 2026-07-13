using System;

namespace TimTro_Backend.Models
{
    public class RoommateProfile
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }

        // Thông tin giới tính
        public string? GioiTinh { get; set; } // "Nam" | "Nu"
        public string? GioiTinhMongMuon { get; set; } // "Nam" | "Nu" | "TatCa"

        // Thông tin tài chính
        public double? NganSachToiThieu { get; set; }
        public double? NganSachToiDa { get; set; }

        // Tiêu chí lối sống (JSON string)
        public string? TieuChiLoiSong { get; set; }

        // Vị trí tâm tìm kiếm
        public string? DiaChiKhuVuc { get; set; }
        public double? ViDoMucTieu { get; set; }
        public double? KinhDoMucTieu { get; set; }
        public int BanKinhTimKiemToiDa { get; set; } = 3000;

        // Trạng thái hiển thị (false = đã ghép nối thành công, ẩn khỏi danh sách)
        public bool IsActive { get; set; } = true;

        // Navigation property
        public User User { get; set; }
    }
}
