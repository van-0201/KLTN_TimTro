using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimTro_Backend.Data;
using TimTro_Backend.DTOs;
using TimTro_Backend.Services.Notification;
using TimTro_Backend.Services.Email;

namespace TimTro_Backend.Services.Appointment
{
    public class AppointmentService : IAppointmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;

        public AppointmentService(ApplicationDbContext context, INotificationService notificationService, IEmailService emailService)
        {
            _context = context;
            _notificationService = notificationService;
            _emailService = emailService;
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
            await _notificationService.CreateNotificationAsync(request.NguoiNhanHenId, $"Bạn có một yêu cầu lịch hẹn mới từ {loadedAppt.NguoiKhoiTao.HoTen} vào lúc {request.ThoiGianHen.AddHours(7):dd/MM/yyyy HH:mm}.");

            // Email receiver
            if (!string.IsNullOrEmpty(loadedAppt.NguoiNhanHen?.Email))
            {
                string emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #3b82f6; color: white; padding: 15px; text-align: center;'>
                        <h2 style='margin: 0;'>Yêu cầu lịch hẹn mới</h2>
                    </div>
                    <div style='padding: 20px; color: #333;'>
                        <p>Chào bạn,</p>
                        <p>Bạn vừa nhận được một yêu cầu đặt lịch hẹn xem phòng từ người dùng <b>{loadedAppt.NguoiKhoiTao.HoTen}</b>.</p>
                        <p>Thời gian hẹn dự kiến: <b>{request.ThoiGianHen.AddHours(7):dd/MM/yyyy HH:mm}</b>.</p>
                        <p>Vui lòng đăng nhập hệ thống để phản hồi (Xác nhận / Từ chối / Đề xuất giờ khác).</p>
                        <br/>
                        <p style='color: #666; font-size: 14px;'>Trân trọng,<br/>Đội ngũ Phongtro.vn</p>
                    </div>
                </div>";
                await _emailService.SendEmailAsync(loadedAppt.NguoiNhanHen.Email, "Yêu cầu lịch hẹn mới - Phongtro.vn", emailBody);
            }

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
                .Include(a => a.NguoiKhoiTao)
                .Include(a => a.NguoiNhanHen)
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
            var otherPartyEmail = appt.NguoiKhoiTaoId == userId ? appt.NguoiNhanHen?.Email : appt.NguoiKhoiTao?.Email;
            
            string statusStr = status == "DaXacNhan" ? "đã xác nhận" : "đã từ chối/hủy";
            await _notificationService.CreateNotificationAsync(otherPartyId, $"Lịch hẹn của bạn vào {appt.ThoiGianHen.AddHours(7):dd/MM/yyyy HH:mm} {statusStr}.");

            // Email other party
            if (!string.IsNullOrEmpty(otherPartyEmail))
            {
                string actionColor = status == "DaXacNhan" ? "#10b981" : "#ef4444";
                string emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: {actionColor}; color: white; padding: 15px; text-align: center;'>
                        <h2 style='margin: 0;'>Cập nhật lịch hẹn</h2>
                    </div>
                    <div style='padding: 20px; color: #333;'>
                        <p>Chào bạn,</p>
                        <p>Lịch hẹn xem phòng của bạn vào lúc <b>{appt.ThoiGianHen.AddHours(7):dd/MM/yyyy HH:mm}</b> hiện đã được cập nhật thành: <b>{statusStr.ToUpper()}</b>.</p>
                        <p>Vui lòng đăng nhập ứng dụng để xem chi tiết.</p>
                        <br/>
                        <p style='color: #666; font-size: 14px;'>Trân trọng,<br/>Đội ngũ Phongtro.vn</p>
                    </div>
                </div>";
                await _emailService.SendEmailAsync(otherPartyEmail, $"Cập nhật lịch hẹn - Phongtro.vn", emailBody);
            }

            return true;
        }

        public async Task<bool> UpdateAppointmentTimeAsync(Guid appointmentId, Guid userId, DateTime newTime)
        {
            var appt = await _context.Appointments
                .Include(a => a.NguoiKhoiTao)
                .Include(a => a.NguoiNhanHen)
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
            var otherPartyEmail = appt.NguoiKhoiTaoId == userId ? appt.NguoiNhanHen?.Email : appt.NguoiKhoiTao?.Email;
            
            await _notificationService.CreateNotificationAsync(otherPartyId, $"Đối tác đã đề xuất đổi giờ hẹn sang {newTime.AddHours(7):dd/MM/yyyy HH:mm}. Vui lòng xác nhận lại.");

            // Email other party
            if (!string.IsNullOrEmpty(otherPartyEmail))
            {
                string emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #f59e0b; color: white; padding: 15px; text-align: center;'>
                        <h2 style='margin: 0;'>Đề xuất đổi giờ hẹn</h2>
                    </div>
                    <div style='padding: 20px; color: #333;'>
                        <p>Chào bạn,</p>
                        <p>Đối tác của bạn vừa đề xuất chuyển lịch hẹn xem phòng sang thời gian mới là: <b>{newTime.AddHours(7):dd/MM/yyyy HH:mm}</b>.</p>
                        <p>Vui lòng đăng nhập hệ thống để Xác nhận giờ mới này hoặc Đề xuất lại giờ khác phù hợp hơn.</p>
                        <br/>
                        <p style='color: #666; font-size: 14px;'>Trân trọng,<br/>Đội ngũ Phongtro.vn</p>
                    </div>
                </div>";
                await _emailService.SendEmailAsync(otherPartyEmail, $"Thay đổi giờ hẹn - Phongtro.vn", emailBody);
            }

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
