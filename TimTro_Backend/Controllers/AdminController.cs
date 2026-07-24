using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using TimTro_Backend.Services.Admin;
using TimTro_Backend.DTOs;

namespace TimTro_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Tất cả endpoints đều yêu cầu đăng nhập
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        /// <summary>
        /// Xem bài đăng chờ duyệt: Admin và Moderator
        /// </summary>
        [HttpGet("pending-posts")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> GetPendingPosts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var posts = await _adminService.GetPendingPostsAsync(page, pageSize);
            return Ok(posts);
        }

        /// <summary>
        /// Duyệt bài: Admin và Moderator
        /// </summary>
        [HttpPut("approve-post/{id}")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> ApprovePost(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var modId);

            var res = await _adminService.ApprovePostAsync(id, modId);
            if (!res) return BadRequest(new { message = "Không thể duyệt bài. Bài đăng không tồn tại hoặc không ở trạng thái chờ duyệt." });
            return Ok(new { message = "Duyệt bài thành công" });
        }

        /// <summary>
        /// Từ chối bài: Admin và Moderator
        /// </summary>
        [HttpPut("reject-post/{id}")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> RejectPost(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var modId);

            var res = await _adminService.RejectPostAsync(id, modId);
            if (!res) return BadRequest(new { message = "Không thể từ chối bài. Bài đăng không tồn tại hoặc không ở trạng thái chờ duyệt." });
            return Ok(new { message = "Đã từ chối bài đăng" });
        }

        /// <summary>
        /// Thống kê tổng quan (Dashboard): Chỉ Admin
        /// </summary>
        [HttpGet("statistics")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetStatistics(
            [FromQuery] int? month = null, 
            [FromQuery] int? year = null,
            [FromQuery] string? loaiBaiDang = null,
            [FromQuery] string? vaiTro = null)
        {
            var stats = await _adminService.GetStatisticsAsync(month, year, loaiBaiDang, vaiTro);
            return Ok(stats);
        }

        /// <summary>
        /// Dữ liệu biểu đồ (Dashboard): Chỉ Admin
        /// </summary>
        [HttpGet("chart-statistics")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetChartStatistics(
            [FromQuery] int months = 6,
            [FromQuery] string? loaiBaiDang = null,
            [FromQuery] string? vaiTro = null,
            [FromQuery] int? year = null)
        {
            var stats = await _adminService.GetChartStatisticsAsync(months, loaiBaiDang, vaiTro, year);
            return Ok(stats);
        }

        // ===== USER MANAGEMENT (Admin only) =====

        /// <summary>
        /// Lấy danh sách tài khoản, hỗ trợ tìm kiếm: Chỉ Admin
        /// </summary>
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsers(
            [FromQuery] string? search = null,
            [FromQuery] string? vaiTro = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var users = await _adminService.GetUsersAsync(search, vaiTro, page, pageSize);
            return Ok(users);
        }

        /// <summary>
        /// Tạo tài khoản mới: Chỉ Admin, không được tạo Admin
        /// </summary>
        [HttpPost("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            try
            {
                await _adminService.CreateUserAsync(request);
                return Ok(new { message = "Tạo tài khoản thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Khóa / Mở khóa tài khoản: Chỉ Admin
        /// </summary>
        [HttpPut("users/{id}/toggle-lock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleLockUser(Guid id)
        {
            try
            {
                var result = await _adminService.ToggleLockUserAsync(id);
                if (!result) return NotFound(new { message = "Không tìm thấy tài khoản." });
                return Ok(new { message = "Đã cập nhật trạng thái tài khoản." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa tài khoản: Chỉ Admin, không xóa được Admin
        /// </summary>
        [HttpDelete("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                await _adminService.DeleteUserAsync(id);
                return Ok(new { message = "Xóa tài khoản thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Đặt mật khẩu mặc định: Chỉ Admin
        /// </summary>
        [HttpPut("users/{id}/reset-password")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResetUserPassword(Guid id)
        {
            try
            {
                await _adminService.ResetUserPasswordAsync(id);
                return Ok(new { message = "Đã đặt lại mật khẩu mặc định." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thông tin liên hệ hỗ trợ (Moderator hoặc Admin)
        /// </summary>
        [HttpGet("support-contact")]
        [Authorize]
        public async Task<IActionResult> GetSupportContact()
        {
            try
            {
                var contact = await _adminService.GetSupportContactAsync();
                if (contact == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin hỗ trợ viên." });
                }
                return Ok(contact);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
