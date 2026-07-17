using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using TimTro_Backend.Data;
using TimTro_Backend.DTOs;
using TimTro_Backend.Models;

using TimTro_Backend.Models;
using TimTro_Backend.Services.Notification;
using TimTro_Backend.Services.Email;

namespace TimTro_Backend.Services.Roommate
{
    public class RoommateService : IRoommateService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;

        public RoommateService(ApplicationDbContext context, INotificationService notificationService, IEmailService emailService)
        {
            _context = context;
            _notificationService = notificationService;
            _emailService = emailService;
        }

        public async Task<RoommateProfileResponse?> GetMyProfileAsync(Guid userId)
        {
            var profile = await _context.RoommateProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null) return null;
            return MapToResponse(profile);
        }

        public async Task<RoommateProfileResponse?> GetProfileByIdAsync(Guid profileId, Guid currentUserId)
        {
            var profile = await _context.RoommateProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == profileId);

            if (profile == null) return null;
            return await EnrichProfileResponse(profile, currentUserId);
        }

        public async Task<RoommateProfileResponse?> GetProfileByUserIdAsync(Guid targetUserId, Guid currentUserId)
        {
            var profile = await _context.RoommateProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == targetUserId);

            if (profile == null) return null;
            return await EnrichProfileResponse(profile, currentUserId);
        }

        // Tính khoảng cách và trả về response đầy đủ
        private async Task<RoommateProfileResponse> EnrichProfileResponse(RoommateProfile profile, Guid currentUserId)
        {
            var response = MapToResponse(profile);
            var myProfile = await _context.RoommateProfiles.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            if (myProfile?.ViDoMucTieu != null && myProfile?.KinhDoMucTieu != null
                && profile.ViDoMucTieu != null && profile.KinhDoMucTieu != null)
            {
                response.DistanceKm = CalculateDistance(
                    myProfile.ViDoMucTieu.Value, myProfile.KinhDoMucTieu.Value,
                    profile.ViDoMucTieu.Value, profile.KinhDoMucTieu.Value);
            }
            return response;
        }

        public async Task<RoommateProfileResponse> UpsertProfileAsync(Guid userId, RoommateProfileRequest request)
        {
            var profile = await _context.RoommateProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            bool wasInactive = profile != null && !profile.IsActive;

            if (profile == null)
            {
                profile = new RoommateProfile { UserId = userId };
                _context.RoommateProfiles.Add(profile);
            }

            profile.GioiTinh = request.GioiTinh;
            profile.GioiTinhMongMuon = request.GioiTinhMongMuon;
            profile.NganSachToiThieu = request.NganSachToiThieu;
            profile.NganSachToiDa = request.NganSachToiDa;
            profile.TieuChiLoiSong = request.TieuChiLoiSong;
            profile.DiaChiKhuVuc = request.DiaChiKhuVuc;
            profile.ViDoMucTieu = request.ViDoMucTieu;
            profile.KinhDoMucTieu = request.KinhDoMucTieu;
            profile.BanKinhTimKiemToiDa = request.BanKinhTimKiemToiDa;

            // Nếu đang ẩn (đã ghép nối trước đó) và người dùng lưu lại -> mở lại
            if (wasInactive)
            {
                profile.IsActive = true;

                // Hủy MatchRequest DaDongY cũ để người dùng có thể tìm kiếm lại từ đầu
                var oldConfirmed = await _context.MatchRequests
                    .Where(m => m.TrangThai == "DaDongY"
                        && (m.NguoiGuiId == userId || m.NguoiNhanId == userId))
                    .ToListAsync();

                // Lấy tên người dùng hiện tại để làm thông báo
                var currentUser = await _context.Users.FindAsync(userId);
                string currentUserName = currentUser?.HoTen ?? "Người bạn ghép";

                foreach (var r in oldConfirmed)
                {
                    r.TrangThai = "DaHuy";

                    // Tìm ID của người đối tác bị hủy ghép
                    var partnerId = r.NguoiGuiId == userId ? r.NguoiNhanId : r.NguoiGuiId;

                    // Gửi thông báo nhắc nhở đối tác tự bật lại hồ sơ
                    await _notificationService.CreateNotificationAsync(
                        partnerId,
                        $"⚠️ {currentUserName} đã hủy ghép phòng. Hồ sơ tìm người ở ghép của bạn hiện vẫn đang ĐƯỢC ẨN. Nếu bạn có nhu cầu tiếp tục tìm người ghép phòng, vui lòng cập nhật lại hồ sơ để bật lại."
                    );
                }
            }

            await _context.SaveChangesAsync();

            profile = await _context.RoommateProfiles
                .Include(p => p.User)
                .FirstAsync(p => p.Id == profile.Id);

            return MapToResponse(profile);
        }

        public async Task<PagedResult<RoommateProfileResponse>> SearchProfilesAsync(Guid currentUserId, int page = 1, int pageSize = 12)
        {
            var myProfile = await _context.RoommateProfiles.FirstOrDefaultAsync(p => p.UserId == currentUserId);

            // Chặn tìm kiếm nếu chưa có hồ sơ HOẶC hồ sơ đang bị ẩn do đã ghép phòng thành công (IsActive = false)
            if (myProfile == null || !myProfile.IsActive)
            {
                return new PagedResult<RoommateProfileResponse> { TotalRecords = 0, TotalPages = 0, CurrentPage = 1, Items = new List<RoommateProfileResponse>() };
            }

            var query = _context.RoommateProfiles
                .Include(p => p.User)
                .Where(p => p.UserId != currentUserId && p.IsActive)
                .AsQueryable();

            var all = await query.ToListAsync();

            // Lọc giới tính 2 chiều và bán kính giao thoa
            var filtered = all.Where(p =>
            {
                bool myGenderOk = myProfile.GioiTinhMongMuon == "TatCa"
                    || myProfile.GioiTinhMongMuon == p.GioiTinh;

                bool theirGenderOk = p.GioiTinhMongMuon == "TatCa"
                    || p.GioiTinhMongMuon == myProfile.GioiTinh;

                if (!myGenderOk || !theirGenderOk) return false;

                if (myProfile.ViDoMucTieu == null || p.ViDoMucTieu == null) return false;
                
                double distanceKm = CalculateDistance(
                    myProfile.ViDoMucTieu.Value, myProfile.KinhDoMucTieu.Value,
                    p.ViDoMucTieu.Value, p.KinhDoMucTieu.Value);
                
                double distanceM = distanceKm * 1000;
                
                // Hai vòng tròn tìm kiếm phải giao thoa với nhau
                // (Khoảng cách giữa 2 tâm <= Tổng 2 bán kính)
                if (distanceM > (myProfile.BanKinhTimKiemToiDa + p.BanKinhTimKiemToiDa))
                    return false;

                return true;
            }).ToList();

            // Tính % tương thích và khoảng cách
            var responses = filtered.Select(p =>
            {
                var res = MapToResponse(p);
                res.MatchPercentage = CalculateMatchPercentage(myProfile?.TieuChiLoiSong, p.TieuChiLoiSong);
                if (myProfile?.ViDoMucTieu != null && p.ViDoMucTieu != null)
                    res.DistanceKm = CalculateDistance(
                        myProfile.ViDoMucTieu.Value, myProfile.KinhDoMucTieu!.Value,
                        p.ViDoMucTieu.Value, p.KinhDoMucTieu!.Value);
                return res;
            }).OrderByDescending(r => r.MatchPercentage).ToList();

            var totalRecords = responses.Count;
            var items = responses.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            return new PagedResult<RoommateProfileResponse>
            {
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                CurrentPage = page,
                Items = items
            };
        }

        public async Task<MatchRequestResponse> SendMatchRequestAsync(Guid senderId, Guid receiverId)
        {
            var existing = await _context.MatchRequests
                .FirstOrDefaultAsync(m =>
                    (m.NguoiGuiId == senderId && m.NguoiNhanId == receiverId) ||
                    (m.NguoiGuiId == receiverId && m.NguoiNhanId == senderId));

            if (existing != null)
            {
                // Nếu đã bị từ chối HOẶC đã bị hủy (do 1 trong 2 người cập nhật hồ sơ) → cho phép gửi lại bằng cách xóa record cũ
                if (existing.TrangThai == "TuChoi" || existing.TrangThai == "DaHuy")
                {
                    _context.MatchRequests.Remove(existing);
                    await _context.SaveChangesAsync();
                }
                else
                    throw new Exception("Bạn đã có yêu cầu ghép nối tới người này đang chờ xử lý hoặc đã đồng ý.");
            }

            var request = new MatchRequest
            {
                NguoiGuiId = senderId,
                NguoiNhanId = receiverId,
                TrangThai = "ChoXacNhan",
                NgayTao = DateTime.UtcNow
            };

            _context.MatchRequests.Add(request);
            await _context.SaveChangesAsync();

            var requestWithUsers = await _context.MatchRequests
                .Include(m => m.NguoiGui)
                .Include(m => m.NguoiNhan)
                .FirstAsync(m => m.Id == request.Id);

            // Gửi thông báo cho người nhận
            await _notificationService.CreateNotificationAsync(
                receiverId, 
                $"Bạn vừa nhận được một yêu cầu ghép phòng từ {requestWithUsers.NguoiGui.HoTen}."
            );

            // Gửi Email
            if (!string.IsNullOrEmpty(requestWithUsers.NguoiNhan?.Email))
            {
                string emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #f59e0b; color: white; padding: 15px; text-align: center;'>
                        <h2 style='margin: 0;'>Yêu cầu ghép phòng mới</h2>
                    </div>
                    <div style='padding: 20px; color: #333;'>
                        <p>Chào bạn,</p>
                        <p>Bạn vừa nhận được một lời mời ghép phòng từ người dùng <b>{requestWithUsers.NguoiGui.HoTen}</b>.</p>
                        <p>Vui lòng đăng nhập vào ứng dụng để xem chi tiết hồ sơ của đối tác và đưa ra phản hồi (Đồng ý / Từ chối).</p>
                        <br/>
                        <p style='color: #666; font-size: 14px;'>Trân trọng,<br/>Đội ngũ Phongtro.vn</p>
                    </div>
                </div>";
                await _emailService.SendEmailAsync(requestWithUsers.NguoiNhan.Email, "Yêu cầu ghép phòng mới - Phongtro.vn", emailBody);
            }

            return MapToMatchResponse(requestWithUsers, senderId);
        }

        public async Task<PagedResult<MatchRequestResponse>> GetMyMatchRequestsAsync(Guid userId, int page = 1, int pageSize = 10)
        {
            var query = _context.MatchRequests
                .Include(m => m.NguoiGui)
                .Include(m => m.NguoiNhan)
                .Where(m => m.NguoiGuiId == userId || m.NguoiNhanId == userId)
                .OrderByDescending(m => m.NgayTao);

            var totalRecords = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<MatchRequestResponse>
            {
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                CurrentPage = page,
                Items = items.Select(m => MapToMatchResponse(m, userId)).ToList()
            };
        }

        public async Task<bool> UpdateMatchStatusAsync(Guid requestId, Guid receiverId, string status)
        {
            var request = await _context.MatchRequests
                .FirstOrDefaultAsync(m => m.Id == requestId && m.NguoiNhanId == receiverId);

            if (request == null) return false;

            request.TrangThai = status;

            // Nếu đồng ý ghép nối -> ẩn hồ sơ của cả 2 và hủy các yêu cầu còn lại
            if (status == "DaDongY")
            {
                var profileSender = await _context.RoommateProfiles.FirstOrDefaultAsync(p => p.UserId == request.NguoiGuiId);
                var profileReceiver = await _context.RoommateProfiles.FirstOrDefaultAsync(p => p.UserId == receiverId);
                if (profileSender != null) profileSender.IsActive = false;
                if (profileReceiver != null) profileReceiver.IsActive = false;

                // Tự động hủy tất cả MatchRequest ChoXacNhan còn lại của cả 2 người
                // (trừ request hiện tại vừa được DaDongY)
                var otherPendingRequests = await _context.MatchRequests
                    .Where(m => m.Id != requestId
                        && m.TrangThai == "ChoXacNhan"
                        && (m.NguoiGuiId == request.NguoiGuiId
                            || m.NguoiNhanId == request.NguoiGuiId
                            || m.NguoiGuiId == receiverId
                            || m.NguoiNhanId == receiverId))
                    .ToListAsync();

                foreach (var r in otherPendingRequests)
                    r.TrangThai = "DaHuy";
            }

            await _context.SaveChangesAsync();

            // Gửi thông báo cho người gửi (người khởi tạo request)
            var receiver = await _context.Users.FindAsync(receiverId);
            var sender = await _context.Users.FindAsync(request.NguoiGuiId);
            
            string actionStr = status == "DaDongY" ? "chấp nhận" : "từ chối";
            if (receiver != null)
            {
                await _notificationService.CreateNotificationAsync(
                    request.NguoiGuiId,
                    $"{receiver.HoTen} đã {actionStr} yêu cầu ghép phòng của bạn."
                );

                if (status == "DaDongY" && sender != null && !string.IsNullOrEmpty(sender.Email))
                {
                    string emailBody = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                        <div style='background-color: #10b981; color: white; padding: 15px; text-align: center;'>
                            <h2 style='margin: 0;'>Ghép phòng thành công!</h2>
                        </div>
                        <div style='padding: 20px; color: #333;'>
                            <p>Chúc mừng bạn!</p>
                            <p>Yêu cầu ghép phòng của bạn đã được <b>{receiver.HoTen}</b> chấp nhận.</p>
                            <p>Hãy chủ động liên hệ với đối tác qua số điện thoại: <b>{receiver.SoDienThoai}</b> để cùng nhau trao đổi chi tiết và tìm thuê căn phòng ưng ý nhé.</p>
                            <br/>
                            <p style='color: #666; font-size: 14px;'>Trân trọng,<br/>Đội ngũ Phongtro.vn</p>
                        </div>
                    </div>";
                    await _emailService.SendEmailAsync(sender.Email, "Ghép phòng thành công - Phongtro.vn", emailBody);
                }
            }

            return true;
        }

        public async Task<MatchStatusResponse> GetMatchStatusAsync(Guid currentUserId, Guid targetUserId)
        {
            var request = await _context.MatchRequests
                .FirstOrDefaultAsync(m =>
                    (m.NguoiGuiId == currentUserId && m.NguoiNhanId == targetUserId) ||
                    (m.NguoiGuiId == targetUserId && m.NguoiNhanId == currentUserId));

            if (request == null)
                return new MatchStatusResponse { Status = "NotSent" };

            // Debug: Trả về trạng thái rõ ràng
            string status = request.TrangThai switch
            {
                "ChoXacNhan" => "Pending",
                "DaDongY" => "Confirmed",
                "TuChoi" => "Rejected",
                _ => "NotSent"
            };

            return new MatchStatusResponse
            {
                Status = status,
                IsSender = request.NguoiGuiId == currentUserId, // Vẫn đúng
                RequestId = request.Id
            };
        }

        // -------- Helpers --------

        private double CalculateMatchPercentage(string? myCriteria, string? theirCriteria)
        {
            if (string.IsNullOrEmpty(myCriteria) || string.IsNullOrEmpty(theirCriteria)) return 0;

            try
            {
                var myDict = JsonSerializer.Deserialize<Dictionary<string, string>>(myCriteria);
                var theirDict = JsonSerializer.Deserialize<Dictionary<string, string>>(theirCriteria);
                if (myDict == null || theirDict == null) return 0;

                int total = myDict.Count;
                if (total == 0) return 0;

                int matches = myDict.Count(kv => theirDict.TryGetValue(kv.Key, out var v) && v == kv.Value);
                return Math.Round((double)matches / total * 100, 1);
            }
            catch
            {
                return 0;
            }
        }

        // Công thức Haversine - tính khoảng cách giữa 2 điểm (km)
        private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371;
            var dLat = ToRad(lat2 - lat1);
            var dLon = ToRad(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                  + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
                  * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return Math.Round(R * c, 2);
        }

        private static double ToRad(double deg) => deg * Math.PI / 180;

        private RoommateProfileResponse MapToResponse(RoommateProfile profile)
        {
            return new RoommateProfileResponse
            {
                Id = profile.Id,
                UserId = profile.UserId,
                HoTen = profile.User?.HoTen ?? "",
                GioiTinh = profile.GioiTinh,
                GioiTinhMongMuon = profile.GioiTinhMongMuon,
                NganSachToiThieu = profile.NganSachToiThieu,
                NganSachToiDa = profile.NganSachToiDa,
                TieuChiLoiSong = profile.TieuChiLoiSong,
                DiaChiKhuVuc = profile.DiaChiKhuVuc,
                ViDoMucTieu = profile.ViDoMucTieu,
                KinhDoMucTieu = profile.KinhDoMucTieu,
                BanKinhTimKiemToiDa = profile.BanKinhTimKiemToiDa,
                IsActive = profile.IsActive
            };
        }

        private MatchRequestResponse MapToMatchResponse(MatchRequest request, Guid viewingUserId)
        {
            // Thông tin liên hệ của đối phương chỉ hiện khi đã đồng ý
            string? contactInfo = null;
            string? soDienThoaiDoiPhuong = null;
            string? tenDoiPhuong = null;
            string? emailDoiPhuong = null;

            if (request.TrangThai == "DaDongY")
            {
                bool isSender = request.NguoiGuiId == viewingUserId;
                var otherUser = isSender ? request.NguoiNhan : request.NguoiGui;
                contactInfo = $"{otherUser?.SoDienThoai} | {otherUser?.Email}";
                soDienThoaiDoiPhuong = otherUser?.SoDienThoai;
                emailDoiPhuong = otherUser?.Email;
                tenDoiPhuong = otherUser?.HoTen;
            }

            return new MatchRequestResponse
            {
                Id = request.Id,
                NguoiGuiId = request.NguoiGuiId,
                NguoiGuiTen = request.NguoiGui?.HoTen ?? "",
                NguoiNhanId = request.NguoiNhanId,
                NguoiNhanTen = request.NguoiNhan?.HoTen ?? "",
                TrangThai = request.TrangThai,
                NgayTao = request.NgayTao,
                ThongTinLienHe = contactInfo,
                SoDienThoaiDoiPhuong = soDienThoaiDoiPhuong,
                EmailDoiPhuong = emailDoiPhuong,
                TenDoiPhuong = tenDoiPhuong
            };
        }
    }
}

