using System;

namespace TimTro_Backend.DTOs
{
    public class RoommateProfileRequest
    {
        public string? GioiTinh { get; set; }
        public string? GioiTinhMongMuon { get; set; }
        public double? NganSachToiThieu { get; set; }
        public double? NganSachToiDa { get; set; }
        public string? TieuChiLoiSong { get; set; }
        public string? DiaChiKhuVuc { get; set; }
        public double? ViDoMucTieu { get; set; }
        public double? KinhDoMucTieu { get; set; }
        public int BanKinhTimKiemToiDa { get; set; } = 3000;
    }

    public class RoommateProfileResponse
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string? GioiTinh { get; set; }
        public string? GioiTinhMongMuon { get; set; }
        public double? NganSachToiThieu { get; set; }
        public double? NganSachToiDa { get; set; }
        public string? TieuChiLoiSong { get; set; }
        public string? DiaChiKhuVuc { get; set; }
        public double? ViDoMucTieu { get; set; }
        public double? KinhDoMucTieu { get; set; }
        public int BanKinhTimKiemToiDa { get; set; }
        public bool IsActive { get; set; }
        public double MatchPercentage { get; set; }
        // Khoảng cách tính từ tâm của người đang xem (km)
        public double? DistanceKm { get; set; }
        // Thông tin liên hệ - chỉ trả về khi đã ghép nối thành công
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
    }

    public class MatchRequestResponse
    {
        public Guid Id { get; set; }
        public Guid NguoiGuiId { get; set; }   // UserId
        public string NguoiGuiTen { get; set; } = string.Empty;
        public Guid NguoiNhanId { get; set; }   // UserId
        public string NguoiNhanTen { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public DateTime NgayTao { get; set; }
        public string? ThongTinLienHe { get; set; } // Chỉ trả về khi TrangThai = DaDongY
        // Tách riêng để frontend dùng cho Zalo QR
        public string? SoDienThoaiDoiPhuong { get; set; }
        public string? EmailDoiPhuong { get; set; }
        public string? TenDoiPhuong { get; set; }
    }

    public class MatchStatusResponse
    {
        // NotSent / Pending / Confirmed / Rejected
        public string Status { get; set; } = "NotSent";
        // true = người dùng hiện tại là người đã gửi yêu cầu
        public bool IsSender { get; set; }
        public Guid? RequestId { get; set; }
    }
}
