using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using TimTro_Backend.Data;
using TimTro_Backend.DTOs;
using TimTro_Backend.Models;
using TimTro_Backend.Services.Email;

namespace TimTro_Backend.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;

        public AuthService(ApplicationDbContext context, IConfiguration config, IMemoryCache cache, IEmailService emailService)
        {
            _context = context;
            _config = config;
            _cache = cache;
            _emailService = emailService;
        }

        public async Task SendRegisterOtpAsync(string email)
        {
            if (await _context.Users.AnyAsync(u => u.Email == email))
            {
                throw new Exception("Email đã được sử dụng.");
            }

            var random = new Random();
            string otp = random.Next(100000, 999999).ToString();

            _cache.Set($"REGISTER_OTP_{email}", otp, TimeSpan.FromMinutes(5));

            string subject = "Mã xác nhận đăng ký tài khoản Tìm Trọ";
            string htmlMessage = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
                    <h2 style='color: #4f46e5; text-align: center;'>Xác nhận địa chỉ Email</h2>
                    <p>Chào bạn,</p>
                    <p>Cảm ơn bạn đã đăng ký tài khoản trên nền tảng Tìm Trọ. Để hoàn tất đăng ký, vui lòng sử dụng mã xác nhận dưới đây:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; background-color: #f3f4f6; padding: 15px 30px; border-radius: 8px;'>{otp}</span>
                    </div>
                    <p>Mã này có hiệu lực trong vòng <strong>5 phút</strong>.</p>
                    <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 12px; color: #888; text-align: center;'>Đội ngũ Tìm Trọ</p>
                </div>";

            await _emailService.SendEmailAsync(email, subject, htmlMessage);
        }

        public async Task<User> RegisterAsync(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new Exception("Email đã được sử dụng.");
            }

            if (!_cache.TryGetValue($"REGISTER_OTP_{request.Email}", out string cachedOtp) || cachedOtp != request.OTP)
            {
                throw new Exception("Mã OTP không hợp lệ hoặc đã hết hạn.");
            }

            // Remove OTP from cache after successful validation
            _cache.Remove($"REGISTER_OTP_{request.Email}");

            var user = new User
            {
                HoTen = request.HoTen,
                Email = request.Email,
                SoDienThoai = request.SoDienThoai,
                VaiTro = request.VaiTro,
                MatKhauBam = BCrypt.Net.BCrypt.HashPassword(request.MatKhau)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<string> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.MatKhau, user.MatKhauBam))
            {
                throw new Exception("Email hoặc mật khẩu không chính xác.");
            }
            if (!user.TrangThaiTaiKhoan)
            {
                throw new Exception("Tài khoản của bạn đã bị khóa, vui lòng liên hệ admin để được hỗ trợ.");
            }

            return GenerateJwtToken(user);
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.MatKhauBam))
                throw new Exception("Mật khẩu cũ không chính xác.");

            user.MatKhauBam = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.HoTen = request.HoTen;
            user.SoDienThoai = request.SoDienThoai;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<UserDto> GetMeAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                HoTen = user.HoTen,
                Email = user.Email,
                SoDienThoai = user.SoDienThoai,
                VaiTro = user.VaiTro,
                TrangThaiTaiKhoan = user.TrangThaiTaiKhoan,
                NgayTao = user.NgayTao,
                NgayHetHanDichVu = user.NgayHetHanDichVu
            };
        }

        private string GenerateJwtToken(TimTro_Backend.Models.User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.VaiTro)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
