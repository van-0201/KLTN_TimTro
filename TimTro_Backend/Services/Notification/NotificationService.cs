using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimTro_Backend.Data;
using TimTro_Backend.DTOs;

namespace TimTro_Backend.Services.Notification
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<NotificationResponse>> GetMyNotificationsAsync(Guid userId)
        {
            var notifs = await _context.Notifications
                .Where(n => n.MaNguoiDung == userId)
                .OrderByDescending(n => n.NgayTao)
                .ToListAsync();

            return notifs.Select(n => new NotificationResponse
            {
                Id = n.Id,
                MaNguoiDung = n.MaNguoiDung,
                NoiDung = n.NoiDung,
                DaDoc = n.DaDoc,
                NgayTao = n.NgayTao
            });
        }

        public async Task<bool> MarkAsReadAsync(Guid notificationId, Guid userId)
        {
            var notif = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.MaNguoiDung == userId);
            if (notif == null) return false;

            notif.DaDoc = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CreateNotificationAsync(Guid userId, string content)
        {
            var notif = new Models.Notification
            {
                MaNguoiDung = userId,
                NoiDung = content
            };
            _context.Notifications.Add(notif);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
