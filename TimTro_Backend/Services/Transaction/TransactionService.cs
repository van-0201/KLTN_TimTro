using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimTro_Backend.Data;
using TimTro_Backend.DTOs;
using TimTro_Backend.Services.Notification;

namespace TimTro_Backend.Services.Transaction
{
    public class TransactionService : ITransactionService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public TransactionService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        private TransactionResponse MapToResponse(TimTro_Backend.Models.Transaction tx)
        {
            return new TransactionResponse
            {
                Id = tx.Id,
                NguoiDungId = tx.NguoiDungId,
                NguoiDungTen = tx.NguoiDung?.HoTen ?? "",
                NguoiDungPhone = tx.NguoiDung?.SoDienThoai ?? "",
                NguoiDungEmail = tx.NguoiDung?.Email ?? "",
                LoaiGoi = tx.LoaiGoi,
                SoTien = tx.SoTien,
                NoiDungChuyenKhoan = tx.NoiDungChuyenKhoan,
                MaQR = tx.MaQR,
                TrangThai = tx.TrangThai,
                NgayTao = tx.NgayTao,
                NgayDuyet = tx.NgayDuyet,
                NguoiDuyetTen = tx.NguoiDuyet?.HoTen
            };
        }

        public async Task<TransactionResponse> CreateTransactionAsync(Guid userId, CreateTransactionRequest request)
        {
            bool hasPending = await _context.Transactions
                .AnyAsync(t => t.NguoiDungId == userId && t.TrangThai == "ChoDuyet");

            if (hasPending)
            {
                throw new InvalidOperationException("Bạn đang có một giao dịch nạp tiền chờ xử lý. Vui lòng chờ Admin duyệt trước khi tạo yêu cầu mới.");
            }
            var tx = new TimTro_Backend.Models.Transaction
            {
                NguoiDungId = userId,
                LoaiGoi = request.LoaiGoi,
                SoTien = request.SoTien,
                NoiDungChuyenKhoan = request.NoiDungChuyenKhoan,
                MaQR = request.MaQR,
                TrangThai = "ChoDuyet",
                NgayTao = DateTime.UtcNow
            };

            _context.Transactions.Add(tx);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);
            var adminList = await _context.Users
                .Where(u => u.VaiTro == "Admin" || u.VaiTro == "Moderator")
                .ToListAsync();
            
            var packageName = request.LoaiGoi == "Goi7Ngay" ? "Gói 7 Ngày" :
                              request.LoaiGoi == "Goi30Ngay" ? "Gói 30 Ngày" :
                              request.LoaiGoi == "Goi365Ngay" ? "Gói 365 Ngày" : request.LoaiGoi;

            foreach (var admin in adminList)
            {
                await _notificationService.CreateNotificationAsync(admin.Id,
                    $"Giao dịch mới: Người dùng \"{user?.HoTen}\" đã nạp tiền mua \"{packageName}\". Vui lòng kiểm tra.");
            }

            return MapToResponse(tx);
        }

        public async Task<PagedResult<TransactionResponse>> GetMyTransactionsAsync(Guid userId, int page = 1, int pageSize = 10)
        {
            var query = _context.Transactions
                .Include(t => t.NguoiDung)
                .Where(t => t.NguoiDungId == userId)
                .OrderByDescending(t => t.NgayTao);

            var totalRecords = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<TransactionResponse>
            {
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                CurrentPage = page,
                Items = items.Select(MapToResponse).ToList()
            };
        }

        public async Task<PagedResult<TransactionResponse>> GetAllPendingAsync(int page = 1, int pageSize = 10, string? search = null)
        {
            var query = _context.Transactions
                .Include(t => t.NguoiDung)
                .Where(t => t.TrangThai == "ChoDuyet")
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(t => t.NguoiDung != null && t.NguoiDung.HoTen.ToLower().Contains(s));
            }

            var totalRecords = await query.CountAsync();
            var items = await query.OrderByDescending(t => t.NgayTao)
                                   .Skip((page - 1) * pageSize)
                                   .Take(pageSize)
                                   .ToListAsync();

            return new PagedResult<TransactionResponse>
            {
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                CurrentPage = page,
                Items = items.Select(MapToResponse).ToList()
            };
        }

        public async Task<bool> ApproveTransactionAsync(Guid id, Guid adminId, ApproveTransactionRequest request)
        {
            var tx = await _context.Transactions.Include(t => t.NguoiDung).FirstOrDefaultAsync(t => t.Id == id);
            if (tx == null) return false;

            tx.TrangThai = request.TrangThai;
            tx.NguoiDuyetId = adminId;
            tx.NgayDuyet = DateTime.UtcNow;

            if (request.TrangThai == "ThanhCong")
            {
                int daysToAdd = 0;
                if (tx.LoaiGoi == "Goi7Ngay") daysToAdd = 7;
                else if (tx.LoaiGoi == "Goi30Ngay") daysToAdd = 30;
                else if (tx.LoaiGoi == "Goi365Ngay") daysToAdd = 365;

                var user = tx.NguoiDung;
                if (user != null)
                {
                    if (user.NgayHetHanDichVu == null || user.NgayHetHanDichVu < DateTime.UtcNow)
                        user.NgayHetHanDichVu = DateTime.UtcNow.AddDays(daysToAdd);
                    else
                        user.NgayHetHanDichVu = user.NgayHetHanDichVu.Value.AddDays(daysToAdd);
                }

                var packageName = tx.LoaiGoi == "Goi7Ngay" ? "Gói 7 Ngày" :
                                  tx.LoaiGoi == "Goi30Ngay" ? "Gói 30 Ngày" :
                                  tx.LoaiGoi == "Goi365Ngay" ? "Gói 365 Ngày" : tx.LoaiGoi;
                                  
                await _notificationService.CreateNotificationAsync(tx.NguoiDungId,
                    $"Thành công! Giao dịch mua \"{packageName}\" của bạn đã được duyệt. Tài khoản được cộng thêm {daysToAdd} ngày sử dụng.");
            }
            else if (request.TrangThai == "TuChoi")
            {
                var packageName = tx.LoaiGoi == "Goi7Ngay" ? "Gói 7 Ngày" :
                                  tx.LoaiGoi == "Goi30Ngay" ? "Gói 30 Ngày" :
                                  tx.LoaiGoi == "Goi365Ngay" ? "Gói 365 Ngày" : tx.LoaiGoi;

                await _notificationService.CreateNotificationAsync(tx.NguoiDungId,
                    $"Từ chối: Giao dịch mua \"{packageName}\" của bạn bị từ chối do không nhận được tiền hoặc lỗi. Vui lòng liên hệ Admin.");
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PagedResult<TransactionResponse>> GetHistoryAsync(Guid userId, string role, int page = 1, int pageSize = 10, string? search = null)
        {
            var query = _context.Transactions
                .Include(t => t.NguoiDung)
                .Include(t => t.NguoiDuyet)
                .AsQueryable();

            if (role != "Admin" && role != "Moderator")
            {
                query = query.Where(t => t.NguoiDungId == userId);
            }

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(t => t.NguoiDung != null && t.NguoiDung.HoTen.ToLower().Contains(s));
            }

            var totalRecords = await query.CountAsync();
            var items = await query.OrderByDescending(t => t.NgayTao)
                                   .Skip((page - 1) * pageSize)
                                   .Take(pageSize)
                                   .ToListAsync();

            return new PagedResult<TransactionResponse>
            {
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                CurrentPage = page,
                Items = items.Select(MapToResponse).ToList()
            };
        }
    }
}
