using TimTro_Backend.DTOs;

namespace TimTro_Backend.Services.Admin
{
    public interface IAdminService
    {
        Task<PagedResult<RoomPostResponse>> GetPendingPostsAsync(int page = 1, int pageSize = 10);
        Task<bool> ApprovePostAsync(Guid postId, Guid moderatorId);
        Task<bool> RejectPostAsync(Guid postId, Guid moderatorId);
        Task<AdminStatisticsResponse> GetStatisticsAsync(int? month = null, int? year = null);

        // User management (Admin only)
        Task<PagedResult<UserDto>> GetUsersAsync(string? search = null, int page = 1, int pageSize = 10);
        Task<bool> ToggleLockUserAsync(Guid userId);
        Task DeleteUserAsync(Guid userId);
        Task ResetUserPasswordAsync(Guid userId);
        
        Task<UserDto> GetSupportContactAsync();
    }
}
