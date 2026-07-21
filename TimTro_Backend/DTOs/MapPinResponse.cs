using System;

namespace TimTro_Backend.DTOs
{
    public class MapPinResponse
    {
        public Guid Id { get; set; }
        public string TieuDe { get; set; }
        public decimal GiaThue { get; set; }
        public double ViDoThucTe { get; set; }
        public double KinhDoThucTe { get; set; }
    }
}
