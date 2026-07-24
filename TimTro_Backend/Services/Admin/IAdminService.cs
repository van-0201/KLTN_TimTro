using TimTro_Backend.DTOs;
using System.Collections.Generic;

namespace TimTro_Backend.Services.Admin
{
    public interface IAdminService
    {
        Task<PagedResult<RoomPostResponse>> GetPendingPostsAsync(int page = 1, int pageSize = 10);
        Task<bool> ApprovePostAsync(Guid postId, Guid moderatorId);
        Task<bool> RejectPostAsync(Guid postId, Guid moderatorId);
        Task<AdminStatisticsResponse> GetStatisticsAsync(int? month = null, int? year = null, string? loaiBaiDang = null, string? vaiTro = null);
        Task<List<ChartDataResponse>> GetChartStatisticsAsync(int months = 6, string? loaiBaiDang = null, string? vaiTro = null, int? year = null);

        // User management (Admin only)
        Task<PagedResult<UserDto>> GetUsersAsync(string? search = null, string? vaiTro = null, int page = 1, int pageSize = 10);
        Task CreateUserAsync(CreateUserRequest request);
        Task<bool> ToggleLockUserAsync(Guid userId);
        Task DeleteUserAsync(Guid userId);
        Task ResetUserPasswordAsync(Guid userId);
        
        Task<UserDto> GetSupportContactAsync();
    }
}
