using System;

namespace TimTro_Backend.Models
{
    public class RoomImage
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RoomPostId { get; set; }
        public string DuongDanHinhAnh { get; set; } // URL from Cloudinary
        public string MaDinhDanhCloudinary { get; set; } // Public ID for Cloudinary deletion

        // Navigation property
        public RoomPost RoomPost { get; set; }
    }
}
