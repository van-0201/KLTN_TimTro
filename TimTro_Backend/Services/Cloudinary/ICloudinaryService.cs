using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace TimTro_Backend.Services.Cloudinary
{
    public interface ICloudinaryService
    {
        Task<(string Url, string PublicId)> UploadImageAsync(IFormFile file);
        Task<bool> DeleteImageAsync(string publicId);
    }
}
