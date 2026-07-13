using System.Threading.Tasks;
using TimTro_Backend.DTOs;
using TimTro_Backend.Models;

namespace TimTro_Backend.Services.Auth
{
    public interface IAuthService
    {
        Task<User> RegisterAsync(RegisterRequest request);
        Task<string> LoginAsync(LoginRequest request);
        Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
        Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    }
}
