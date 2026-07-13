using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimTro_Backend.Data;
using TimTro_Backend.DTOs;

using TimTro_Backend.Services.Notification;

namespace TimTro_Backend.Services.Appointment
{
    public class AppointmentService : IAppointmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public AppointmentService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<AppointmentResponse> CreateAppointmentAsync(Guid senderId, CreateAppointmentRequest request)
        {
            var appt = new TimTro_Backend.Models.Appointment
            {
                NguoiKhoiTaoId = senderId,
                NguoiNhanHenId = request.NguoiNhanHenId,
                RoomPostId = request.RoomPostId,
                LoaiLichHen = request.LoaiLichHen,
                ThoiGianHen = request.ThoiGianHen,
                DiaDiemHen = request.DiaDiemHen,
                GhiChu = request.GhiChu,
                TrangThaiLichHen = "ChoPhanHoi",
                PendingRescheduleById = senderId // Khi tạo mới, coi như người gửi đề xuất giờ này
            };

            _context.Appointments.Add(appt);
            await _context.SaveChangesAsync();

            var loadedAppt = await _context.Appointments
                .Include(a => a.NguoiKhoiTao)
                .Include(a => a.NguoiNhanHen)
                .Include(a => a.RoomPost)
                .FirstAsync(a => a.Id == appt.Id);
                
            // Send notification to the receiver
            await _notificationService.CreateNotificationAsync(request.NguoiNhanHenId, $"Bạn có một yêu cầu lịch hẹn mới từ {loadedAppt.NguoiKhoiTao.HoTen} vào lúc {request.ThoiGianHen:dd/MM/yyyy HH:mm}.");

            return MapToResponse(loadedAppt);
        }

        public async Task<PagedResult<AppointmentResponse>> GetMyAppointmentsAsync(Guid userId, int page = 1, int pageSize = 10)
        {
            var query = _context.Appointments
                .Include(a => a.NguoiKhoiTao)
                .Include(a => a.NguoiNhanHen)
                .Include(a => a.RoomPost)
                .Where(a => a.NguoiKhoiTaoId == userId || a.NguoiNhanHenId == userId)
                .OrderByDescending(a => a.ThoiGianHen);

            var totalRecords = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<AppointmentResponse>
            {
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                CurrentPage = page,
                Items = items.Select(MapToResponse).ToList()
            };
        }

        public async Task<bool> UpdateAppointmentStatusAsync(Guid appointmentId, Guid userId, string status)
        {
            var appt = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == appointmentId && (a.NguoiKhoiTaoId == userId || a.NguoiNhanHenId == userId));

            if (appt == null) return false;

            // Only the party who didn't propose the last time can confirm. Both can cancel.
            if (status == "DaXacNhan")
            {
                if (appt.PendingRescheduleById.HasValue)
                {
                    if (appt.PendingRescheduleById.Value == userId) return false;
                }
                else
                {
                    if (appt.NguoiNhanHenId != userId) return false;
                }
            }

            appt.TrangThaiLichHen = status;
            await _context.SaveChangesAsync();

            // Send notification to the other party
            Guid otherPartyId = appt.NguoiKhoiTaoId == userId ? appt.NguoiNhanHenId : appt.NguoiKhoiTaoId;
            string statusStr = status == "DaXacNhan" ? "đã xác nhận" : "đã từ chối/hủy";
            await _notificationService.CreateNotificationAsync(otherPartyId, $"Lịch hẹn của bạn vào {appt.ThoiGianHen:dd/MM/yyyy HH:mm} {statusStr}.");

            return true;
        }

        public async Task<bool> UpdateAppointmentTimeAsync(Guid appointmentId, Guid userId, DateTime newTime)
        {
            var appt = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == appointmentId && (a.NguoiKhoiTaoId == userId || a.NguoiNhanHenId == userId));

            if (appt == null) return false;

            // Only allow changing time if it's ChoPhanHoi
            if (appt.TrangThaiLichHen != "ChoPhanHoi") return false;

            appt.ThoiGianHen = newTime;
            appt.TrangThaiLichHen = "ChoPhanHoi"; // Reset status
            appt.PendingRescheduleById = userId; // Ghi nhận người vừa đề xuất đổi giờ
            await _context.SaveChangesAsync();

            // Send notification to the other party
            Guid otherPartyId = appt.NguoiKhoiTaoId == userId ? appt.NguoiNhanHenId : appt.NguoiKhoiTaoId;
            await _notificationService.CreateNotificationAsync(otherPartyId, $"Đối tác đã đề xuất đổi giờ hẹn sang {newTime:dd/MM/yyyy HH:mm}. Vui lòng xác nhận lại.");

            return true;
        }

        private AppointmentResponse MapToResponse(TimTro_Backend.Models.Appointment appt)
        {
            return new AppointmentResponse
            {
                Id = appt.Id,
                NguoiKhoiTaoId = appt.NguoiKhoiTaoId,
                NguoiKhoiTaoTen = appt.NguoiKhoiTao?.HoTen ?? "",
                NguoiKhoiTaoPhone = appt.NguoiKhoiTao?.SoDienThoai ?? "",
                NguoiNhanHenId = appt.NguoiNhanHenId,
                NguoiNhanHenTen = appt.NguoiNhanHen?.HoTen ?? "",
                NguoiNhanHenPhone = appt.NguoiNhanHen?.SoDienThoai ?? "",
                RoomPostId = appt.RoomPostId,
                RoomPostTitle = appt.RoomPost?.TieuDe ?? "",
                LoaiLichHen = appt.LoaiLichHen,
                ThoiGianHen = appt.ThoiGianHen,
                DiaDiemHen = appt.DiaDiemHen,
                GhiChu = appt.GhiChu,
                TrangThaiLichHen = appt.TrangThaiLichHen,
                PendingRescheduleById = appt.PendingRescheduleById
            };
        }
    }
}
