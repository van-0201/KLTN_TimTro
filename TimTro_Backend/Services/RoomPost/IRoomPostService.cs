using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TimTro_Backend.DTOs;

namespace TimTro_Backend.Services.RoomPost
{
    public interface IRoomPostService
    {
        Task<PagedResult<RoomPostResponse>> GetAllAsync(int page = 1, int pageSize = 12, string? searchKeyword = null, decimal? minPrice = null, decimal? maxPrice = null, decimal? minArea = null, decimal? maxArea = null, string? loaiPhong = null, List<string>? amenities = null, double? userLat = null, double? userLng = null, double? radiusKm = null);
        Task<List<MapPinResponse>> GetMapPinsAsync(string? searchKeyword = null, decimal? minPrice = null, decimal? maxPrice = null, decimal? minArea = null, decimal? maxArea = null, string? loaiPhong = null, List<string>? amenities = null, double? userLat = null, double? userLng = null, double? radiusKm = null);
        Task<PagedResult<RoomPostResponse>> GetAllActiveAsync(int page = 1, int pageSize = 12);
        Task<PagedResult<RoomPostResponse>> GetMyPostsAsync(Guid userId, int page = 1, int pageSize = 10);
        Task<RoomPostResponse?> GetByIdAsync(Guid id);
        Task<RoomPostResponse> CreateAsync(Guid userId, CreateRoomPostRequest request, List<IFormFile> images);
        Task IncrementViewCountAsync(Guid id);
        Task<RoomPostResponse?> UpdateAsync(Guid id, Guid userId, UpdateRoomPostRequest request);
        Task<(bool Success, string ErrorMessage)> DeleteAsync(Guid id, Guid userId);
        Task<bool> ToggleHideAsync(Guid id, Guid userId);
    }
}
