using System.ComponentModel.DataAnnotations;

namespace TimTro_Backend.DTOs
{
    public class CreateUserRequest
    {
        [Required(ErrorMessage = "Họ tên không được để trống")]
        public string HoTen { get; set; }

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Số điện thoại không được để trống")]
        public string SoDienThoai { get; set; }

        [Required(ErrorMessage = "Vai trò không được để trống")]
        public string VaiTro { get; set; }
    }
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Họ tên không được để trống")]
        public string HoTen { get; set; }

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Số điện thoại không được để trống")]
        public string SoDienThoai { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d).{6,}$", ErrorMessage = "Mật khẩu phải dài tối thiểu 6 ký tự, bao gồm cả chữ cái và chữ số.")]
        public string MatKhau { get; set; }

        [Required(ErrorMessage = "Vai trò không được để trống")]
        public string VaiTro { get; set; } // NguoiThue, ChuTro
    }

    public class LoginRequest
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string MatKhau { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập mật khẩu cũ")]
        public string OldPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới")]
        [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d).{6,}$", ErrorMessage = "Mật khẩu mới phải dài tối thiểu 6 ký tự, bao gồm cả chữ cái và chữ số.")]
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
