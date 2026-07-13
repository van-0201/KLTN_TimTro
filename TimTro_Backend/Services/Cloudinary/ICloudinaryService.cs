using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace TimTro_Backend.Services.Cloudinary
{
    public interface ICloudinaryService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task<bool> DeleteImageAsync(string publicId);
    }
}
