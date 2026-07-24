using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using TimTro_Backend.DTOs;
using TimTro_Backend.Services.Report;

namespace TimTro_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateReport([FromForm] CreateReportRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            if (User.IsInRole("ChuTro"))
                return Forbid();

            await _reportService.CreateReportAsync(userId, request);
            return Ok(new { message = "Đã gửi báo cáo thành công." });
        }

        [HttpGet("all")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            var reports = await _reportService.GetAllReportsAsync(page, pageSize, search);
            return Ok(reports);
        }

        [HttpPut("{id}/resolve")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> ResolveReport(Guid id, [FromBody] string action)
        {
            // action: "DaXuLy" | "BacBo"
            var moderatorIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(moderatorIdStr) || !Guid.TryParse(moderatorIdStr, out var moderatorId))
                return Unauthorized();

            var result = await _reportService.ResolveReportAsync(id, moderatorId, action);
            if (!result) return NotFound();
            return Ok(new { message = "Đã xử lý báo cáo." });
        }
    }
}
