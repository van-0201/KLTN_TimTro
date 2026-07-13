using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimTro_Backend.Data;
using TimTro_Backend.DTOs;
using TimTro_Backend.Models;
using TimTro_Backend.Services.Cloudinary;
using TimTro_Backend.Services.Notification;

namespace TimTro_Backend.Services.RoomPost
{
    public class RoomPostService : IRoomPostService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICloudinaryService _cloudinary;
        private readonly INotificationService _notificationService;

        public RoomPostService(ApplicationDbContext context, ICloudinaryService cloudinary, INotificationService notificationService)
        {
            _context = context;
            _cloudinary = cloudinary;
            _notificationService = notificationService;
        }

        public async Task<PagedResult<RoomPostResponse>> GetAllAsync(int page = 1, int pageSize = 12, string? searchKeyword = null, decimal? minPrice = null, decimal? maxPrice = null, decimal? minArea = null, decimal? maxArea = null, string? loaiPhong = null, List<string>? amenities = null, double? userLat = null, double? userLng = null, double? radiusKm = null)
        {
            var query = _context.RoomPosts
                .Include(rp => rp.ChuTro)
                .Include(rp => rp.RoomImages)
                .Where(rp => rp.TrangThaiPhong == "ConTrong" && rp.TrangThaiKiemDuyet == "DaDuyet" && !rp.IsHidden)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchKeyword))
            {
                query = query.Where(rp => rp.TieuDe.Contains(searchKeyword) || rp.DiaChiChiTiet.Contains(searchKeyword));
            }

            if (minPrice.HasValue) query = query.Where(rp => rp.GiaThue >= minPrice.Value);
            if (maxPrice.HasValue) query = query.Where(rp => rp.GiaThue <= maxPrice.Value);
            if (minArea.HasValue) query = query.Where(rp => rp.DienTich >= minArea.Value);
            if (maxArea.HasValue) query = query.Where(rp => rp.DienTich <= maxArea.Value);
            if (!string.IsNullOrEmpty(loaiPhong)) query = query.Where(rp => rp.LoaiBaiDang == loaiPhong);

            // Amenities filter (AND logic, JSON string match)
            if (amenities != null && amenities.Any())
            {
                foreach (var amenity in amenities)
                {
                    query = query.Where(rp => EF.Functions.Like(rp.TienIch, $"%\"{amenity}\"%"));
                }
            }

            // Location filter - Bounding Box (Lọc thô ở CSDL)
            if (userLat.HasValue && userLng.HasValue && radiusKm.HasValue && radiusKm.Value > 0)
            {
                // 1 độ vĩ tuyến ~ 111.32 km
                double latDelta = radiusKm.Value / 111.32;
                // 1 độ kinh tuyến ~ 111.32 km * cos(latitude)
                double lngDelta = radiusKm.Value / (111.32 * Math.Cos(userLat.Value * Math.PI / 180.0));

                double minLat = userLat.Value - latDelta;
                double maxLat = userLat.Value + latDelta;
                double minLng = userLng.Value - lngDelta;
                double maxLng = userLng.Value + lngDelta;

                query = query.Where(rp => rp.ViDoThucTe >= minLat && rp.ViDoThucTe <= maxLat 
                                       && rp.KinhDoThucTe >= minLng && rp.KinhDoThucTe <= maxLng);
            }

            var posts = await query.ToListAsync();

            // Location filter - Haversine (Lọc tinh ở RAM loại bỏ các điểm góc hình vuông)
            if (userLat.HasValue && userLng.HasValue && radiusKm.HasValue && radiusKm.Value > 0)
            {
                var filteredPosts = new List<TimTro_Backend.Models.RoomPost>();
                foreach (var post in posts)
                {
                    double distance = CalculateHaversineDistance(userLat.Value, userLng.Value, post.ViDoThucTe, post.KinhDoThucTe);
                    if (distance <= radiusKm.Value)
                    {
                        filteredPosts.Add(post);
                    }
                }
                posts = filteredPosts;
            }

            var totalRecords = posts.Count;
            var items = posts.OrderByDescending(p => p.Id)
                             .Skip((page - 1) * pageSize)
                             .Take(pageSize)
                             .Select(MapToResponse)
                             .ToList();

            return new PagedResult<RoomPostResponse>
            {
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                CurrentPage = page,
                Items = items
            };
        }

        private double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371; // Radius of the earth in km
            var dLat = Deg2Rad(lat2 - lat1);
            var dLon = Deg2Rad(lon2 - lon1);
            var a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(Deg2Rad(lat1)) * Math.Cos(Deg2Rad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var d = R * c; // Distance in km
            return d;
        }

        private double Deg2Rad(double deg)
        {
            return deg * (Math.PI / 180);
        }

        public async Task<PagedResult<RoomPostResponse>> GetAllActiveAsync(int page = 1, int pageSize = 12)
        {
            var query = _context.RoomPosts
                .Include(rp => rp.ChuTro)
                .Include(rp => rp.RoomImages)
                .Where(rp => rp.TrangThaiPhong == "ConTrong" && rp.TrangThaiKiemDuyet == "DaDuyet" && !rp.IsHidden)
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

        public async Task<PagedResult<RoomPostResponse>> GetMyPostsAsync(Guid userId, int page = 1, int pageSize = 10)
        {
            var query = _context.RoomPosts
                .Include(rp => rp.ChuTro)
                .Include(rp => rp.RoomImages)
                .Where(rp => rp.ChuTroId == userId)
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

        public async Task<RoomPostResponse?> GetByIdAsync(Guid id)
        {
            var post = await _context.RoomPosts
                .Include(rp => rp.ChuTro)
                .Include(rp => rp.RoomImages)
                .FirstOrDefaultAsync(rp => rp.Id == id);

            if (post == null) return null;
            return MapToResponse(post);
        }

        public async Task<RoomPostResponse> CreateAsync(Guid userId, CreateRoomPostRequest request, List<IFormFile> images)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("Không tìm thấy tài khoản.");

            if (user.VaiTro == "NguoiThue")
            {
                // Người thuê trọ chỉ được đăng bài tìm người ở ghép, không cần gói dịch vụ
                if (request.LoaiBaiDang != "TimNguoiOGhep")
                    throw new Exception("Người thuê trọ chỉ được đăng bài tìm người ở ghép.");
            }
            else if (user.VaiTro == "ChuTro")
            {
                // Chủ trọ không được đăng bài tìm người ở ghép
                if (request.LoaiBaiDang == "TimNguoiOGhep")
                    throw new Exception("Chủ trọ không được đăng bài tìm người ở ghép.");
                // Chủ trọ phải có gói dịch vụ hợp lệ
                if (!user.NgayHetHanDichVu.HasValue || user.NgayHetHanDichVu.Value < DateTime.UtcNow)
                    throw new Exception("Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục đăng tin.");
            }
            else
            {
                // Các vai trò khác (Admin, Moderator) không được đăng bài qua API này
                throw new Exception("Bạn không có quyền đăng tin.");
            }

            var post = new TimTro_Backend.Models.RoomPost
            {
                ChuTroId = userId,
                TieuDe = request.TieuDe,
                MoTaChiTiet = request.MoTaChiTiet,
                GiaThue = request.GiaThue,
                DienTich = request.DienTich,
                DiaChiChiTiet = request.DiaChiChiTiet,
                ViDoThucTe = request.ViDoThucTe,
                KinhDoThucTe = request.KinhDoThucTe,
                LoaiBaiDang = request.LoaiBaiDang,
                TrangThaiPhong = "ConTrong",
                TrangThaiKiemDuyet = "ChoDuyet",
                TienIch = request.TienIch
            };

            _context.RoomPosts.Add(post);
            await _context.SaveChangesAsync();

            if (request.Images != null && request.Images.Count > 0)
            {
                foreach (var img in request.Images)
                {
                    var result = await _cloudinary.UploadImageAsync(img);
                    if (!string.IsNullOrEmpty(result.Url))
                    {
                        _context.RoomImages.Add(new RoomImage
                        {
                            RoomPostId = post.Id,
                            DuongDanHinhAnh = result.Url,
                            MaDinhDanhCloudinary = result.PublicId ?? ""
                        });
                    }
                }
                await _context.SaveChangesAsync();
            }

            // Thông báo cho Admin/Moderator về bài đăng mới cần duyệt
            var admins = await _context.Users
                .Where(u => u.VaiTro == "Admin" || u.VaiTro == "Moderator")
                .ToListAsync();
            foreach (var admin in admins)
            {
                await _notificationService.CreateNotificationAsync(admin.Id,
                    $"Bài đăng mới cần duyệt: \"{post.TieuDe}\" (đăng bởi {user.HoTen})");
            }

            return await GetByIdAsync(post.Id);
        }

        public async Task<RoomPostResponse?> UpdateAsync(Guid id, Guid userId, UpdateRoomPostRequest request)
        {
            var post = await _context.RoomPosts
                .Include(rp => rp.RoomImages)
                .FirstOrDefaultAsync(rp => rp.Id == id && rp.ChuTroId == userId);

            if (post == null) return null;

            bool contentChanged = 
                post.TieuDe != request.TieuDe ||
                post.MoTaChiTiet != request.MoTaChiTiet ||
                post.GiaThue != request.GiaThue ||
                post.DienTich != request.DienTich ||
                post.DiaChiChiTiet != request.DiaChiChiTiet ||
                post.ViDoThucTe != request.ViDoThucTe ||
                post.KinhDoThucTe != request.KinhDoThucTe ||
                post.LoaiBaiDang != request.LoaiBaiDang ||
                post.TienIch != request.TienIch;

            bool imagesChanged = false;
            if (request.ExistingImages != null)
            {
                var currentImageUrls = post.RoomImages.Select(img => img.DuongDanHinhAnh).ToList();
                if (currentImageUrls.Count != request.ExistingImages.Count || currentImageUrls.Except(request.ExistingImages).Any())
                {
                    imagesChanged = true;
                }
            }
            else if (post.RoomImages.Count > 0)
            {
                imagesChanged = true;
            }

            if (request.NewImages != null && request.NewImages.Count > 0)
            {
                imagesChanged = true;
            }

            bool needsReview = contentChanged || imagesChanged;

            post.TieuDe = request.TieuDe;
            post.MoTaChiTiet = request.MoTaChiTiet;
            post.GiaThue = request.GiaThue;
            post.DienTich = request.DienTich;
            post.DiaChiChiTiet = request.DiaChiChiTiet;
            post.ViDoThucTe = request.ViDoThucTe;
            post.KinhDoThucTe = request.KinhDoThucTe;
            post.LoaiBaiDang = request.LoaiBaiDang;
            post.TienIch = request.TienIch;
            post.TrangThaiPhong = request.TrangThaiPhong;
            
            if (needsReview)
            {
                post.TrangThaiKiemDuyet = "ChoDuyet"; // Yêu cầu duyệt lại khi chỉnh sửa nội dung
            }
            
            post.NgayCapNhat = DateTime.UtcNow;

            if (request.ExistingImages != null)
            {
                var imagesToRemove = post.RoomImages.Where(img => !request.ExistingImages.Contains(img.DuongDanHinhAnh)).ToList();
                foreach (var img in imagesToRemove)
                {
                    if (!string.IsNullOrEmpty(img.MaDinhDanhCloudinary))
                    {
                        await _cloudinary.DeleteImageAsync(img.MaDinhDanhCloudinary);
                    }
                }
                _context.RoomImages.RemoveRange(imagesToRemove);
            }
            else
            {
                foreach (var img in post.RoomImages)
                {
                    if (!string.IsNullOrEmpty(img.MaDinhDanhCloudinary))
                    {
                        await _cloudinary.DeleteImageAsync(img.MaDinhDanhCloudinary);
                    }
                }
                _context.RoomImages.RemoveRange(post.RoomImages); 
            }

            if (request.NewImages != null && request.NewImages.Count > 0)
            {
                foreach (var img in request.NewImages)
                {
                    var result = await _cloudinary.UploadImageAsync(img);
                    if (!string.IsNullOrEmpty(result.Url))
                    {
                        _context.RoomImages.Add(new RoomImage
                        {
                            RoomPostId = post.Id,
                            DuongDanHinhAnh = result.Url,
                            MaDinhDanhCloudinary = result.PublicId ?? ""
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();

            if (needsReview)
            {
                // Thông báo cho Admin/Moderator khi bài đăng được chỉnh sửa cần duyệt lại
                var updatedUser = await _context.Users.FindAsync(userId);
                var adminList = await _context.Users
                    .Where(u => u.VaiTro == "Admin" || u.VaiTro == "Moderator")
                    .ToListAsync();
                foreach (var admin in adminList)
                {
                    await _notificationService.CreateNotificationAsync(admin.Id,
                        $"Bài đăng cần duyệt lại sau chỉnh sửa: \"{post.TieuDe}\" (bởi {updatedUser?.HoTen ?? "Unknown"})");
                }
            }

            return await GetByIdAsync(post.Id);
        }

        public async Task<(bool Success, string ErrorMessage)> DeleteAsync(Guid id, Guid userId)
        {
            var post = await _context.RoomPosts
                .Include(rp => rp.Appointments)
                .Include(rp => rp.Reports)
                .Include(rp => rp.RoomImages)
                .FirstOrDefaultAsync(rp => rp.Id == id && rp.ChuTroId == userId);
                
            if (post == null) return (false, "Bài đăng không tồn tại hoặc bạn không có quyền xóa.");

            if (post.Appointments != null && post.Appointments.Any(a => a.TrangThaiLichHen == "ChoPhanHoi"))
            {
                return (false, "Không thể xóa vì bài đăng đang có yêu cầu lịch hẹn chưa được xác nhận.");
            }

            if (post.Reports != null && post.Reports.Any(r => r.TrangThaiXuLy == "ChoXuLy"))
            {
                return (false, "Không thể xóa vì bài đăng đang bị báo cáo vi phạm và chờ Admin xử lý.");
            }

            // Remove images from Cloudinary
            if (post.RoomImages != null)
            {
                foreach (var img in post.RoomImages)
                {
                    if (!string.IsNullOrEmpty(img.MaDinhDanhCloudinary))
                    {
                        await _cloudinary.DeleteImageAsync(img.MaDinhDanhCloudinary);
                    }
                }
            }

            _context.RoomPosts.Remove(post);
            await _context.SaveChangesAsync();
            return (true, "");
        }

        public async Task<bool> ToggleHideAsync(Guid id, Guid userId)
        {
            var post = await _context.RoomPosts.FirstOrDefaultAsync(rp => rp.Id == id && rp.ChuTroId == userId);
            if (post == null) return false;

            post.IsHidden = !post.IsHidden;
            post.NgayCapNhat = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

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
                ViDoThucTe = post.ViDoThucTe,
                KinhDoThucTe = post.KinhDoThucTe,
                LoaiBaiDang = post.LoaiBaiDang,
                TrangThaiPhong = post.TrangThaiPhong,
                TrangThaiKiemDuyet = post.TrangThaiKiemDuyet,
                IsHidden = post.IsHidden,
                TienIch = post.TienIch,
                NguoiDangTen = post.ChuTro?.HoTen ?? "",
                NguoiDangPhone = post.ChuTro?.SoDienThoai ?? "",
                Images = post.RoomImages?.Select(i => i.DuongDanHinhAnh).ToList() ?? new List<string>()
            };
        }
    }
}
