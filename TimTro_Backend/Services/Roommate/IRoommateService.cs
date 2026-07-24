using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TimTro_Backend.DTOs;

namespace TimTro_Backend.Services.Roommate
{
    public interface IRoommateService
    {
        // Profile
        Task<RoommateProfileResponse?> GetMyProfileAsync(Guid userId);
        Task<RoommateProfileResponse?> GetProfileByIdAsync(Guid profileId, Guid currentUserId);
        Task<RoommateProfileResponse?> GetProfileByUserIdAsync(Guid targetUserId, Guid currentUserId);
        Task<RoommateProfileResponse> UpsertProfileAsync(Guid userId, RoommateProfileRequest request);
        Task<PagedResult<RoommateProfileResponse>> SearchProfilesAsync(Guid currentUserId, int page = 1, int pageSize = 12);
        Task<List<RoomPostResponse>> GetMatchedPostsAsync(Guid targetUserId, Guid currentUserId);
        Task<bool> ToggleProfileActiveAsync(Guid userId);

        // Match
        Task<MatchRequestResponse> SendMatchRequestAsync(Guid senderId, Guid receiverId);
        Task<PagedResult<MatchRequestResponse>> GetMyMatchRequestsAsync(Guid userId, int page = 1, int pageSize = 10);
        Task<bool> UpdateMatchStatusAsync(Guid requestId, Guid receiverId, string status);
        Task<MatchStatusResponse> GetMatchStatusAsync(Guid currentUserId, Guid targetUserId);
    }
}
