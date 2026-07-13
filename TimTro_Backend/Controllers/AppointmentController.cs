using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using TimTro_Backend.DTOs;
using TimTro_Backend.Services.Appointment;

namespace TimTro_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var appt = await _appointmentService.CreateAppointmentAsync(userId, request);
            return Ok(appt);
        }

        [HttpGet("my-appointments")]
        public async Task<IActionResult> GetMyAppointments(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var list = await _appointmentService.GetMyAppointmentsAsync(userId, page, pageSize);
            return Ok(list);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var result = await _appointmentService.UpdateAppointmentStatusAsync(id, userId, status);
            if (!result) return NotFound("Không tìm thấy lịch hẹn hoặc không có quyền.");
            return Ok(new { message = "Đã cập nhật trạng thái lịch hẹn." });
        }
        [HttpPut("{id}/time")]
        public async Task<IActionResult> UpdateTime(Guid id, [FromBody] DateTime newTime)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var result = await _appointmentService.UpdateAppointmentTimeAsync(id, userId, newTime);
            if (!result) return NotFound("Không tìm thấy lịch hẹn hoặc không thể đổi thời gian.");
            return Ok(new { message = "Đã cập nhật thời gian lịch hẹn." });
        }
    }
}
