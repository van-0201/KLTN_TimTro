using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TimTro_Backend.DTOs
{
    public class NotificationResponse
    {
        public Guid Id { get; set; }
        public Guid MaNguoiDung { get; set; }
        public string NoiDung { get; set; }
        public bool DaDoc { get; set; }
        public DateTime NgayTao { get; set; }
    }
}
