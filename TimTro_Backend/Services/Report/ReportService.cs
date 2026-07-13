using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using TimTro_Backend.Data;
using TimTro_Backend.DTOs;
using TimTro_Backend.Services.Cloudinary;
using TimTro_Backend.Services.Notification;

namespace TimTro_Backend.Services.Report
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ICloudinaryService _cloudinaryService;

        public ReportService(ApplicationDbContext context, INotificationService notificationService, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _notificationService = notificationService;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<bool> CreateReportAsync(Guid userId, CreateReportRequest request)
        {
            var minhChungUrls = new List<string>();
            if (request.MinhChungFiles != null && request.MinhChungFiles.Count > 0)
            {
                foreach (var file in request.MinhChungFiles)
                {
                    if (file.Length > 0)
                    {
                        var result = await _cloudinaryService.UploadImageAsync(file);
                        if (!string.IsNullOrEmpty(result.Url))
                            minhChungUrls.Add(result.Url);
                    }
                }
            }

            // Tự động trích xuất ChuTroId từ Bài đăng để lưu vào TaiKhoanBiBaoCaoId
            Guid? targetUserId = request.TaiKhoanBiBaoCaoId;
            string tenBaiDang = "";

            if (request.BaiDangBiBaoCaoId.HasValue)
            {
                var baiDang = await _context.RoomPosts.FindAsync(request.BaiDangBiBaoCaoId.Value);
                if (baiDang != null)
                {
                    targetUserId = baiDang.ChuTroId; // Map chủ phòng
                    tenBaiDang = $" về bài đăng \"{baiDang.TieuDe}\"";
                }
            }

            var report = new Models.Report
            {
                NguoiGuiId = userId,
                BaiDangBiBaoCaoId = request.BaiDangBiBaoCaoId,
                TaiKhoanBiBaoCaoId = targetUserId,
                LyDoPhanAnh = request.LyDoPhanAnh,
                DuongDanMinhChung = JsonSerializer.Serialize(minhChungUrls),
                TrangThaiXuLy = "ChoXuLy",
                NgayTao = DateTime.UtcNow
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            var nguoiGui = await _context.Users.FindAsync(userId);
            string tenNguoiGui = nguoiGui?.HoTen ?? "Người dùng";

            // Gửi thông báo cho cả Admin và Moderator
            var adminsMods = await _context.Users
                .Where(u => u.VaiTro == "Admin" || u.VaiTro == "Moderator")
                .ToListAsync();

            string notifForAdmin = $"⚠️ Có báo cáo vi phạm mới từ {tenNguoiGui}{tenBaiDang}. Vui lòng kiểm tra.";
            foreach (var user in adminsMods)
            {
                await _notificationService.CreateNotificationAsync(user.Id, notifForAdmin);
            }

            return true;
        }

        public async Task<PagedResult<ReportResponse>> GetAllReportsAsync(int page = 1, int pageSize = 10, string? search = null)
        {
            var query = _context.Reports
                .Include(r => r.NguoiGui)
                .Include(r => r.BaiDangBiBaoCao)
                    .ThenInclude(b => b.ChuTro)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(r => r.LyDoPhanAnh.ToLower().Contains(s) || 
                                         (r.BaiDangBiBaoCao != null && r.BaiDangBiBaoCao.TieuDe.ToLower().Contains(s)) || 
                                         (r.NguoiGui != null && r.NguoiGui.Email.ToLower().Contains(s)));
            }

            var totalRecords = await query.CountAsync();
            var reports = await query.OrderByDescending(r => r.NgayTao)
                                     .Skip((page - 1) * pageSize)
                                     .Take(pageSize)
                                     .ToListAsync();

            return new PagedResult<ReportResponse>
            {
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                CurrentPage = page,
                Items = reports.Select(r => new ReportResponse
                {
                    Id = r.Id,
                    NguoiGuiId = r.NguoiGuiId,
                    NguoiGuiName = r.NguoiGui?.HoTen ?? "Ẩn danh",
                    NguoiGuiEmail = r.NguoiGui?.Email ?? "",
                    NguoiGuiSoDienThoai = r.NguoiGui?.SoDienThoai ?? "",
                    BaiDangBiBaoCaoId = r.BaiDangBiBaoCaoId,
                    BaiDangTitle = r.BaiDangBiBaoCao?.TieuDe ?? "",
                    ChuTroId = r.BaiDangBiBaoCao?.ChuTroId,
                    ChuTroName = r.BaiDangBiBaoCao?.ChuTro?.HoTen ?? "",
                    ChuTroEmail = r.BaiDangBiBaoCao?.ChuTro?.Email ?? "",
                    ChuTroSoDienThoai = r.BaiDangBiBaoCao?.ChuTro?.SoDienThoai ?? "",
                    TaiKhoanBiBaoCaoId = r.TaiKhoanBiBaoCaoId,
                    LyDoPhanAnh = r.LyDoPhanAnh,
                    DuongDanMinhChung = r.DuongDanMinhChung ?? "[]",
                    TrangThaiXuLy = r.TrangThaiXuLy,
                    NgayTao = r.NgayTao
                }).ToList()
            };
        }

        public async Task<bool> ResolveReportAsync(Guid reportId, Guid moderatorId, string action)
        {
            var report = await _context.Reports
                .Include(r => r.BaiDangBiBaoCao)
                    .ThenInclude(b => b.ChuTro)
                .Include(r => r.NguoiGui)
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null) return false;

            report.TrangThaiXuLy = action; 
            report.NguoiKiemDuyetXuLyId = moderatorId;
            
            // Nếu xác nhận Vi Phạm thì đổi trạng thái RoomPost
            if (action == "DaXuLy" && report.BaiDangBiBaoCao != null)
            {
                report.BaiDangBiBaoCao.TrangThaiKiemDuyet = "ViPham";
            }

            await _context.SaveChangesAsync();

            string tenBaiDang = report.BaiDangBiBaoCao?.TieuDe ?? "bài đăng";

            string notifForReporter = action == "DaXuLy"
                ? $"✅ Báo cáo của bạn về \"{tenBaiDang}\" đã được quản trị viên xử lý thành công."
                : $"ℹ️ Báo cáo của bạn về \"{tenBaiDang}\" đã được xem xét nhưng không đủ căn cứ để xử lý.";

            await _notificationService.CreateNotificationAsync(report.NguoiGuiId, notifForReporter);

            if (report.BaiDangBiBaoCao?.ChuTroId != null && report.BaiDangBiBaoCao.ChuTroId != report.NguoiGuiId)
            {
                string notifForOwner = action == "DaXuLy"
                    ? $"⚠️ Bài đăng \"{tenBaiDang}\" của bạn đã bị báo cáo và XÁC NHẬN VI PHẠM. Bài đăng đã bị ẩn/đánh dấu."
                    : $"✅ Bài đăng \"{tenBaiDang}\" của bạn bị báo cáo nhưng quản trị viên xác nhận KHÔNG vi phạm.";

                await _notificationService.CreateNotificationAsync(report.BaiDangBiBaoCao.ChuTroId, notifForOwner);
            }

            return true;
        }
    }
}