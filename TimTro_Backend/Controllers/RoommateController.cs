using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using TimTro_Backend.DTOs;
using TimTro_Backend.Services.Roommate;

namespace TimTro_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RoommateController : ControllerBase
    {
        private readonly IRoommateService _roommateService;

        public RoommateController(IRoommateService roommateService)
        {
            _roommateService = roommateService;
        }

        // ---- Profile endpoints ----

        [HttpGet("profile")]
        [Authorize(Roles = "NguoiThue")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var profile = await _roommateService.GetMyProfileAsync(userId);
            if (profile == null) return NotFound("Chưa có hồ sơ.");
            return Ok(profile);
        }

        [HttpGet("profile/by-user/{targetUserId}")]
        [Authorize(Roles = "NguoiThue")]
        public async Task<IActionResult> GetProfileByUserId(Guid targetUserId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var currentUserId))
                return Unauthorized();

            var profile = await _roommateService.GetProfileByUserIdAsync(targetUserId, currentUserId);
            if (profile == null) return NotFound("Không tìm thấy hồ sơ.");
            return Ok(profile);
        }

        [HttpPost("profile")]
        [Authorize(Roles = "NguoiThue")]
        public async Task<IActionResult> UpsertProfile([FromBody] RoommateProfileRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var profile = await _roommateService.UpsertProfileAsync(userId, request);
            return Ok(profile);
        }

        [HttpGet("profiles")]
        [Authorize(Roles = "NguoiThue")]
        public async Task<IActionResult> SearchProfiles(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var profiles = await _roommateService.SearchProfilesAsync(userId, page, pageSize);
            return Ok(profiles);
        }

        // ---- Match Request endpoints (chỉ NguoiThue) ----

        [HttpPost("match/{receiverId}")]
        [Authorize(Roles = "NguoiThue")]
        public async Task<IActionResult> SendMatchRequest(Guid receiverId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            try
            {
                var request = await _roommateService.SendMatchRequestAsync(userId, receiverId);
                return Ok(request);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("match-status/{targetUserId}")]
        [Authorize(Roles = "NguoiThue")]
        public async Task<IActionResult> GetMatchStatus(Guid targetUserId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var result = await _roommateService.GetMatchStatusAsync(userId, targetUserId);
            return Ok(result);
        }

        [HttpGet("matches")]
        [Authorize(Roles = "NguoiThue")]
        public async Task<IActionResult> GetMyMatchRequests(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var requests = await _roommateService.GetMyMatchRequestsAsync(userId, page, pageSize);
            return Ok(requests);
        }

        [HttpPut("match/{requestId}")]
        [Authorize(Roles = "NguoiThue")]
        public async Task<IActionResult> UpdateMatchStatus(Guid requestId, [FromBody] string status)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var success = await _roommateService.UpdateMatchStatusAsync(requestId, userId, status);
            if (!success) return NotFound("Không tìm thấy yêu cầu hoặc bạn không có quyền.");
            return Ok(new { message = "Cập nhật thành công." });
        }
    }
}

