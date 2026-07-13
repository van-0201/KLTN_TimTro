namespace TimTro_Backend.DTOs
{
    public class RegisterRequest
    {
        public string HoTen { get; set; }
        public string Email { get; set; }
        public string SoDienThoai { get; set; }
        public string MatKhau { get; set; }
        public string VaiTro { get; set; } // NguoiThue, ChuTro
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string MatKhau { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UpdateProfileRequest
    {
        public string HoTen { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
    }

    public class UserDto
    {
        public Guid Id { get; set; }
        public string HoTen { get; set; }
        public string Email { get; set; }
        public string SoDienThoai { get; set; }
        public string VaiTro { get; set; }
        public bool TrangThaiTaiKhoan { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime? NgayHetHanDichVu { get; set; }
    }
}
