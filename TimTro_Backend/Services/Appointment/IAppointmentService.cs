using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TimTro_Backend.DTOs;

namespace TimTro_Backend.Services.Appointment
{
    public interface IAppointmentService
    {
        Task<AppointmentResponse> CreateAppointmentAsync(Guid senderId, CreateAppointmentRequest request);
        Task<PagedResult<AppointmentResponse>> GetMyAppointmentsAsync(Guid userId, int page = 1, int pageSize = 10);
        Task<bool> UpdateAppointmentStatusAsync(Guid appointmentId, Guid userId, string status); // DaXacNhan, DaHuy
        Task<bool> UpdateAppointmentTimeAsync(Guid appointmentId, Guid userId, DateTime newTime);
    }
}
