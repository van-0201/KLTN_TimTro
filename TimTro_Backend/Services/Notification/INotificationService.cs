using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TimTro_Backend.DTOs;

namespace TimTro_Backend.Services.Notification
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationResponse>> GetMyNotificationsAsync(Guid userId);
        Task<bool> MarkAsReadAsync(Guid notificationId, Guid userId);
        Task<bool> CreateNotificationAsync(Guid userId, string content);
    }
}
