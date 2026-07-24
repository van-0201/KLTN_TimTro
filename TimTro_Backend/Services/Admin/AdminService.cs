using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimTro_Backend.Data;
using TimTro_Backend.DTOs;
using TimTro_Backend.Models;
using TimTro_Backend.Services.Notification;
using TimTro_Backend.Services.Email;

namespace TimTro_Backend.Services.Admin
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;

        public AdminService(ApplicationDbContext context, INotificationService notificationService, IEmailService emailService)
        {
            _context = context;
            _notificationService = notificationService;
            _emailService = emailService;
        }

        public async Task<PagedResult<RoomPostResponse>> GetPendingPostsAsync(int page = 1, int pageSize = 10)
        {
            var query = _context.RoomPosts
                .Include(rp => rp.ChuTro)
                .Include(rp => rp.RoomImages)
                .Where(rp => rp.TrangThaiKiemDuyet == "ChoDuyet")
                .OrderByDescending(rp => rp.Id);

            var totalRecords = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<RoomPostResponse>
            {
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                CurrentPage = page,
                Items = items.Select(MapToResponse).ToList()
            };
        }

        public async Task<bool> ApprovePostAsync(Guid postId, Guid moderatorId)
        {
            var post = await _context.RoomPosts.Include(rp => rp.ChuTro).FirstOrDefaultAsync(rp => rp.Id == postId);
            if (post == null) return false;

            // Guard: chỉ cho duyệt khi bài đang ở trạng thái chờ duyệt
            if (post.TrangThaiKiemDuyet != "ChoDuyet") return false;

            post.TrangThaiKiemDuyet = "DaDuyet";
            post.NguoiDuyetId = moderatorId;
            await _context.SaveChangesAsync();

            // Notify user
            await _notificationService.CreateNotificationAsync(post.ChuTroId, $"Bài đăng '{post.TieuDe}' của bạn đã được kiểm duyệt và hiện thị.");
            
            // Email user
            if (!string.IsNullOrEmpty(post.ChuTro?.Email))
            {
                string emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #10b981; color: white; padding: 15px; text-align: center;'>
                        <h2 style='margin: 0;'>Bài đăng được duyệt</h2>
                    </div>
                    <div style='padding: 20px; color: #333;'>
                        <p>Chào bạn,</p>
                        <p>Bài đăng <b>{post.TieuDe}</b> của bạn đã được Quản trị viên duyệt thành công và hiện đang hiển thị công khai trên hệ thống.</p>
                        <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
                        <br/>
                        <p style='color: #666; font-size: 14px;'>Trân trọng,<br/>Đội ngũ Phongtro.vn</p>
                    </div>
                </div>";
                await _emailService.SendEmailAsync(post.ChuTro.Email, "Bài đăng được duyệt - Phongtro.vn", emailBody);
            }

            return true;
        }

        public async Task<bool> RejectPostAsync(Guid postId, Guid moderatorId)
        {
            var post = await _context.RoomPosts.Include(rp => rp.ChuTro).FirstOrDefaultAsync(rp => rp.Id == postId);
            if (post == null) return false;

            // Guard: chỉ cho từ chối khi bài đang ở trạng thái chờ duyệt
            if (post.TrangThaiKiemDuyet != "ChoDuyet") return false;

            post.TrangThaiKiemDuyet = "TuChoi";
            post.NguoiDuyetId = moderatorId;
            await _context.SaveChangesAsync();

            // Notify user
            await _notificationService.CreateNotificationAsync(post.ChuTroId, $"Bài đăng '{post.TieuDe}' của bạn đã bị từ chối kiểm duyệt. Vui lòng kiểm tra lại nội dung.");
            
            // Email user
            if (!string.IsNullOrEmpty(post.ChuTro?.Email))
            {
                string emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #ef4444; color: white; padding: 15px; text-align: center;'>
                        <h2 style='margin: 0;'>Bài đăng bị từ chối</h2>
                    </div>
                    <div style='padding: 20px; color: #333;'>
                        <p>Chào bạn,</p>
                        <p>Rất tiếc, bài đăng <b>{post.TieuDe}</b> của bạn không đạt yêu cầu kiểm duyệt của hệ thống.</p>
                        <p>Vui lòng đăng nhập vào tài khoản, kiểm tra lại thông tin, hình ảnh và chỉnh sửa cho phù hợp với quy định trước khi gửi lại yêu cầu.</p>
                        <br/>
                        <p style='color: #666; font-size: 14px;'>Trân trọng,<br/>Đội ngũ Phongtro.vn</p>
                    </div>
                </div>";
                await _emailService.SendEmailAsync(post.ChuTro.Email, "Bài đăng bị từ chối - Phongtro.vn", emailBody);
            }

            return true;
        }

        public async Task<AdminStatisticsResponse> GetStatisticsAsync(int? month = null, int? year = null, string? loaiBaiDang = null, string? vaiTro = null)
        {
            var now = DateTime.UtcNow;
            int targetYear = year ?? now.Year;
            int targetMonth = month ?? now.Month;
            
            var startOfMonth = new DateTime(targetYear, targetMonth, 1);
            var endOfMonth = startOfMonth.AddMonths(1).AddTicks(-1);

            var userQuery = _context.Users.Where(u => u.VaiTro == "NguoiThue" || u.VaiTro == "ChuTro").AsQueryable();
            if (!string.IsNullOrEmpty(vaiTro) && vaiTro != "TatCa")
            {
                userQuery = userQuery.Where(u => u.VaiTro == vaiTro);
            }

            var postQuery = _context.RoomPosts.AsQueryable();
            if (!string.IsNullOrEmpty(loaiBaiDang) && loaiBaiDang != "TatCa")
            {
                postQuery = postQuery.Where(rp => rp.LoaiBaiDang == loaiBaiDang);
            }

            int totalUsers = await userQuery.CountAsync();
            int newUsersThisMonth = await userQuery.CountAsync(u => u.NgayTao >= startOfMonth && u.NgayTao <= endOfMonth);
            int totalPosts = await postQuery.CountAsync();
            int pendingPosts = await postQuery.CountAsync(rp => rp.TrangThaiKiemDuyet == "ChoDuyet");
            int newApprovedPostsThisMonth = await postQuery.CountAsync(rp => rp.TrangThaiKiemDuyet == "DaDuyet" && rp.NgayTao >= startOfMonth && rp.NgayTao <= endOfMonth);
            int pendingReports = await _context.Reports.CountAsync(r => r.TrangThaiXuLy == "ChoXuLy");
            
            decimal revenueThisMonth = await _context.Transactions
                .Where(t => t.TrangThai == "ThanhCong" && t.NgayDuyet != null && t.NgayDuyet >= startOfMonth && t.NgayDuyet <= endOfMonth)
                .SumAsync(t => (decimal?)t.SoTien) ?? 0;

            int nguoiThueCount = await userQuery.CountAsync(u => u.VaiTro == "NguoiThue");
            int chuTroCount = await userQuery.CountAsync(u => u.VaiTro == "ChuTro");
            int moderatorCount = await userQuery.CountAsync(u => u.VaiTro == "Moderator" || u.VaiTro == "Admin");

            return new AdminStatisticsResponse
            {
                TongNguoiDung = totalUsers,
                NguoiDungMoiThangNay = newUsersThisMonth,
                TongBaiDang = totalPosts,
                BaiDangMoiThangNay = newApprovedPostsThisMonth,
                BaiDangChoDuyet = pendingPosts,
                TongBaoCaoChoXuLy = pendingReports,
                DoanhThuThangNay = revenueThisMonth,
                NguoiThueCount = nguoiThueCount,
                ChuTroCount = chuTroCount,
                ModeratorCount = moderatorCount
            };
        }

        public async Task<List<ChartDataResponse>> GetChartStatisticsAsync(int months = 6, string? loaiBaiDang = null, string? vaiTro = null, int? year = null)
        {
            var results = new List<ChartDataResponse>();
            var now = DateTime.UtcNow;

            if (year.HasValue)
            {
                for (int i = 1; i <= 12; i++)
                {
                    if (year.Value > now.Year || (year.Value == now.Year && i > now.Month))
                    {
                        results.Add(new ChartDataResponse
                        {
                            Thang = $"T{i}",
                            DoanhThu = null,
                            NguoiDungMoi = null,
                            BaiDangMoi = null
                        });
                        continue;
                    }

                    var startOfMonth = new DateTime(year.Value, i, 1);
                    var endOfMonth = startOfMonth.AddMonths(1).AddTicks(-1);

                    var userQuery = _context.Users.Where(u => u.VaiTro == "NguoiThue" || u.VaiTro == "ChuTro").AsQueryable();
                    if (!string.IsNullOrEmpty(vaiTro) && vaiTro != "TatCa")
                        userQuery = userQuery.Where(u => u.VaiTro == vaiTro);

                    var postQuery = _context.RoomPosts.AsQueryable();
                    if (!string.IsNullOrEmpty(vaiTro) && vaiTro != "TatCa")
                        postQuery = postQuery.Where(rp => rp.ChuTro.VaiTro == vaiTro);
                    if (!string.IsNullOrEmpty(loaiBaiDang) && loaiBaiDang != "TatCa")
                        postQuery = postQuery.Where(rp => rp.LoaiBaiDang == loaiBaiDang);

                    int newUsers = await userQuery.CountAsync(u => u.NgayTao >= startOfMonth && u.NgayTao <= endOfMonth);
                    int newPosts = await postQuery.CountAsync(rp => rp.TrangThaiKiemDuyet == "DaDuyet" && rp.NgayTao >= startOfMonth && rp.NgayTao <= endOfMonth);
                    decimal revenue = await _context.Transactions
                        .Where(t => t.TrangThai == "ThanhCong" && t.NgayDuyet != null && t.NgayDuyet >= startOfMonth && t.NgayDuyet <= endOfMonth)
                        .SumAsync(t => (decimal?)t.SoTien) ?? 0;

                    results.Add(new ChartDataResponse
                    {
                        Thang = $"T{i}",
                        DoanhThu = revenue,
                        NguoiDungMoi = newUsers,
                        BaiDangMoi = newPosts
                    });
                }
            }
            else
            {
                for (int i = months - 1; i >= 0; i--)
                {
                    var targetDate = now.AddMonths(-i);
                    if (targetDate > now)
                    {
                        results.Add(new ChartDataResponse
                        {
                            Thang = $"T{targetDate.Month}",
                            DoanhThu = null,
                            NguoiDungMoi = null,
                            BaiDangMoi = null
                        });
                        continue;
                    }

                    var startOfMonth = new DateTime(targetDate.Year, targetDate.Month, 1);
                    var endOfMonth = startOfMonth.AddMonths(1).AddTicks(-1);

                    var userQuery = _context.Users.Where(u => u.VaiTro == "NguoiThue" || u.VaiTro == "ChuTro").AsQueryable();
                    if (!string.IsNullOrEmpty(vaiTro) && vaiTro != "TatCa")
                        userQuery = userQuery.Where(u => u.VaiTro == vaiTro);

                    var postQuery = _context.RoomPosts.AsQueryable();
                    if (!string.IsNullOrEmpty(vaiTro) && vaiTro != "TatCa")
                        postQuery = postQuery.Where(rp => rp.ChuTro.VaiTro == vaiTro);
                    if (!string.IsNullOrEmpty(loaiBaiDang) && loaiBaiDang != "TatCa")
                        postQuery = postQuery.Where(rp => rp.LoaiBaiDang == loaiBaiDang);

                    int newUsers = await userQuery.CountAsync(u => u.NgayTao >= startOfMonth && u.NgayTao <= endOfMonth);
                    int newPosts = await postQuery.CountAsync(rp => rp.TrangThaiKiemDuyet == "DaDuyet" && rp.NgayTao >= startOfMonth && rp.NgayTao <= endOfMonth);
                    decimal revenue = await _context.Transactions
                        .Where(t => t.TrangThai == "ThanhCong" && t.NgayDuyet != null && t.NgayDuyet >= startOfMonth && t.NgayDuyet <= endOfMonth)
                        .SumAsync(t => (decimal?)t.SoTien) ?? 0;

                    results.Add(new ChartDataResponse
                    {
                        Thang = $"T{targetDate.Month}",
                        DoanhThu = revenue,
                        NguoiDungMoi = newUsers,
                        BaiDangMoi = newPosts
                    });
                }
            }

            return results;
        }

        // ===== USER MANAGEMENT =====

        public async Task<PagedResult<UserDto>> GetUsersAsync(string? search = null, string? vaiTro = null, int page = 1, int pageSize = 10)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(vaiTro))
            {
                if (vaiTro == "QuanTriVien")
                {
                    query = query.Where(u => u.VaiTro == "Admin" || u.VaiTro == "Moderator");
                }
                else
                {
                    query = query.Where(u => u.VaiTro == vaiTro);
                }
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(u =>
                    u.HoTen.ToLower().Contains(s) ||
                    u.Email.ToLower().Contains(s) ||
                    (u.SoDienThoai != null && u.SoDienThoai.Contains(s)));
            }

            var totalRecords = await query.CountAsync();

            List<User> users;
            if (vaiTro == "QuanTriVien")
            {
                // Order Admin first, then by NgayTao descending
                users = await query.OrderByDescending(u => u.VaiTro == "Admin" ? 1 : 0)
                                   .ThenByDescending(u => u.NgayTao)
                                   .Skip((page - 1) * pageSize)
                                   .Take(pageSize)
                                   .ToListAsync();
            }
            else
            {
                users = await query.OrderByDescending(u => u.NgayTao)
                                   .Skip((page - 1) * pageSize)
                                   .Take(pageSize)
                                   .ToListAsync();
            }

            return new PagedResult<UserDto>
            {
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                CurrentPage = page,
                Items = users.Select(u => new UserDto
                {
                    Id = u.Id,
                    HoTen = u.HoTen,
                    Email = u.Email,
                    SoDienThoai = u.SoDienThoai,
                    VaiTro = u.VaiTro,
                    TrangThaiTaiKhoan = u.TrangThaiTaiKhoan,
                    NgayTao = u.NgayTao,
                    NgayHetHanDichVu = u.NgayHetHanDichVu
                }).ToList()
            };
        }

        public async Task<bool> ToggleLockUserAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            if (user.VaiTro == "Admin")
                throw new Exception("Không thể khóa tài khoản Admin.");

            user.TrangThaiTaiKhoan = !user.TrangThaiTaiKhoan;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task DeleteUserAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new Exception("Không tìm thấy tài khoản.");

            if (user.VaiTro == "Admin")
                throw new Exception("Không thể xóa tài khoản Admin.");

            try
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new Exception("Không thể xóa tài khoản đã có dữ liệu liên kết trên hệ thống.");
            }
        }

        public async Task CreateUserAsync(CreateUserRequest request)
        {
            if (request.VaiTro == "Admin")
                throw new Exception("Không được phép tạo tài khoản Admin.");

            var validRoles = new[] { "NguoiThue", "ChuTro", "Moderator" };
            if (!validRoles.Contains(request.VaiTro))
                throw new Exception("Vai trò không hợp lệ.");

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                throw new Exception("Email đã tồn tại trong hệ thống.");

            if (await _context.Users.AnyAsync(u => u.SoDienThoai == request.SoDienThoai))
                throw new Exception("Số điện thoại đã tồn tại trong hệ thống.");

            var newUser = new User
            {
                HoTen = request.HoTen,
                Email = request.Email,
                SoDienThoai = request.SoDienThoai,
                MatKhauBam = BCrypt.Net.BCrypt.HashPassword("12345678aA@"),
                VaiTro = request.VaiTro,
                TrangThaiTaiKhoan = true,
                NgayTao = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
        }

        public async Task ResetUserPasswordAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new Exception("Không tìm thấy tài khoản.");

            user.MatKhauBam = BCrypt.Net.BCrypt.HashPassword("12345678aA@");
            await _context.SaveChangesAsync();
        }

        public async Task<UserDto> GetSupportContactAsync()
        {
            var supportUser = await _context.Users
                .Where(u => u.TrangThaiTaiKhoan == true && (u.VaiTro == "Moderator" || u.VaiTro == "Admin"))
                .OrderByDescending(u => u.VaiTro == "Moderator") // Ưu tiên Moderator
                .FirstOrDefaultAsync();

            if (supportUser == null) return null;

            return new UserDto
            {
                Id = supportUser.Id,
                HoTen = supportUser.HoTen,
                Email = supportUser.Email,
                SoDienThoai = supportUser.SoDienThoai,
                VaiTro = supportUser.VaiTro
            };
        }

        // ===========================

        private RoomPostResponse MapToResponse(TimTro_Backend.Models.RoomPost post)
        {
            return new RoomPostResponse
            {
                Id = post.Id,
                ChuTroId = post.ChuTroId,
                TieuDe = post.TieuDe,
                MoTaChiTiet = post.MoTaChiTiet,
                GiaThue = post.GiaThue,
                DienTich = post.DienTich,
                DiaChiChiTiet = post.DiaChiChiTiet,
                LoaiBaiDang = post.LoaiBaiDang,
                TrangThaiPhong = post.TrangThaiPhong,
                TrangThaiKiemDuyet = post.TrangThaiKiemDuyet,
                NguoiDangTen = post.ChuTro?.HoTen ?? "",
                NguoiDangPhone = post.ChuTro?.SoDienThoai ?? "",
                Images = post.RoomImages?.Select(i => i.DuongDanHinhAnh).ToList() ?? new List<string>()
            };
        }
    }
}
