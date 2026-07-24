using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using TimTro_Backend.DTOs;
using TimTro_Backend.Services.RoomPost;
using Microsoft.EntityFrameworkCore;

namespace TimTro_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomPostController : ControllerBase
    {
        private readonly IRoomPostService _roomPostService;
        private readonly TimTro_Backend.Data.ApplicationDbContext _context;

        public RoomPostController(IRoomPostService roomPostService, TimTro_Backend.Data.ApplicationDbContext context)
        {
            _roomPostService = roomPostService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? search = null, 
            [FromQuery] decimal? minPrice = null, 
            [FromQuery] decimal? maxPrice = null, 
            [FromQuery] decimal? minArea = null, 
            [FromQuery] decimal? maxArea = null, 
            [FromQuery] string? loaiPhong = null,
            [FromQuery] List<string>? amenities = null,
            [FromQuery] double? userLat = null,
            [FromQuery] double? userLng = null,
            [FromQuery] double? radiusKm = null)
        {
            var posts = await _roomPostService.GetAllAsync(page, pageSize, search, minPrice, maxPrice, minArea, maxArea, loaiPhong, amenities, userLat, userLng, radiusKm);
            return Ok(posts);
        }

        [HttpGet("map-pins")]
        public async Task<IActionResult> GetMapPins(
            [FromQuery] string? search = null, 
            [FromQuery] decimal? minPrice = null, 
            [FromQuery] decimal? maxPrice = null, 
            [FromQuery] decimal? minArea = null, 
            [FromQuery] decimal? maxArea = null, 
            [FromQuery] string? loaiPhong = null,
            [FromQuery] List<string>? amenities = null,
            [FromQuery] double? userLat = null,
            [FromQuery] double? userLng = null,
            [FromQuery] double? radiusKm = null)
        {
            var pins = await _roomPostService.GetMapPinsAsync(search, minPrice, maxPrice, minArea, maxArea, loaiPhong, amenities, userLat, userLng, radiusKm);
            return Ok(pins);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetAllActive(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            var posts = await _roomPostService.GetAllActiveAsync(page, pageSize);
            return Ok(posts);
        }

        [Authorize]
        [HttpGet("my-posts")]
        public async Task<IActionResult> GetMyPosts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var posts = await _roomPostService.GetMyPostsAsync(userId, page, pageSize);

            var user = await _context.Users.FindAsync(userId);
            bool isPackageExpired = user != null && user.VaiTro == "ChuTro" && 
                                    (user.NgayHetHanDichVu == null || user.NgayHetHanDichVu < DateTime.UtcNow);

            return Ok(new {
                items = posts.Items,
                totalPages = posts.TotalPages,
                isPackageExpired = isPackageExpired
            });
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var post = await _roomPostService.GetByIdAsync(id);
            if (post == null) return NotFound("Không tìm thấy bài đăng.");
            return Ok(post);
        }

        [HttpPost("{id}/view")]
        public async Task<IActionResult> IncrementViewCount(Guid id)
        {
            await _roomPostService.IncrementViewCountAsync(id);
            return Ok();
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateRoomPostRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            // Validate: NguoiThue chỉ được đăng bài "Tìm người ở ghép"
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role == "NguoiThue" && request.LoaiBaiDang != "TimNguoiOGhep")
                return StatusCode(403, "Người thuê trọ chỉ được đăng bài tìm người ở ghép.");

            // Validate: ChuTro không được đăng bài "Tìm người ở ghép"
            if (role == "ChuTro" && request.LoaiBaiDang == "TimNguoiOGhep")
                return StatusCode(403, "Chủ trọ không được đăng bài tìm người ở ghép.");

            try
            {
                var post = await _roomPostService.CreateAsync(userId, request, request.Images);
                return CreatedAtAction(nameof(GetById), new { id = post.Id }, post);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromForm] UpdateRoomPostRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            // Validate: NguoiThue chỉ được giữ "Tìm người ở ghép"
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role == "NguoiThue" && request.LoaiBaiDang != "TimNguoiOGhep")
                return StatusCode(403, "Người thuê trọ chỉ được đăng bài tìm người ở ghép.");

            if (role == "ChuTro" && request.LoaiBaiDang == "TimNguoiOGhep")
                return StatusCode(403, "Chủ trọ không được đăng bài tìm người ở ghép.");

            try
            {
                var post = await _roomPostService.UpdateAsync(id, userId, request);
                if (post == null) return NotFound("Bài đăng không tồn tại hoặc bạn không có quyền sửa.");
                return Ok(post);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpPut("toggle-hide/{id}")]
        public async Task<IActionResult> ToggleHide(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            try
            {
                var success = await _roomPostService.ToggleHideAsync(id, userId);
                if (!success) return NotFound("Bài đăng không tồn tại hoặc bạn không có quyền thao tác.");
                
                return Ok(new { Message = "Cập nhật trạng thái thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var result = await _roomPostService.DeleteAsync(id, userId);
            if (!result.Success) return BadRequest(result.ErrorMessage);
            return Ok(new { message = "Xóa bài đăng thành công" });
        }

        [Authorize]
        [HttpGet("check-eligibility")]
        public async Task<IActionResult> CheckEligibility()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();
            
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();
            
            if (user.VaiTro == "NguoiThue")
            {
                if (user.NgayDangTimOGhepGanNhat.HasValue)
                {
                    var daysSinceLastPost = (DateTime.UtcNow - user.NgayDangTimOGhepGanNhat.Value).TotalDays;
                    if (daysSinceLastPost < 7)
                    {
                        int daysLeft = 7 - (int)Math.Floor(daysSinceLastPost);
                        return Ok(new { eligible = false, reason = $"Mỗi 7 ngày bạn chỉ được đăng 1 bài tìm người ở ghép miễn phí. Vui lòng quay lại sau {daysLeft} ngày." });
                    }
                }
                
                var activePostCount = await _context.RoomPosts
                    .CountAsync(p => p.ChuTroId == userId && p.LoaiBaiDang == "TimNguoiOGhep" && !p.IsHidden);
                if (activePostCount >= 1)
                {
                    return Ok(new { eligible = false, reason = "Bạn đang có một bài đăng trên hệ thống (Chờ duyệt / Đang hiển thị / Bị từ chối). Vui lòng cập nhật lại bài cũ hoặc Tạm ẩn/Xóa nó đi trước khi đăng bài mới!" });
                }
            }
            else if (user.VaiTro == "ChuTro")
            {
                if (!user.NgayHetHanDichVu.HasValue || user.NgayHetHanDichVu.Value < DateTime.UtcNow)
                {
                    return Ok(new { eligible = false, reason = "Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục đăng tin." });
                }
            }
            else 
            {
                return Ok(new { eligible = false, reason = "Bạn không có quyền đăng tin." });
            }
            
            return Ok(new { eligible = true });
        }
    }
}
