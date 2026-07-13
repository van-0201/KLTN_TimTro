using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TimTro_Backend.DTOs;

namespace TimTro_Backend.Services.Report
{
    public interface IReportService
    {
        Task<bool> CreateReportAsync(Guid userId, CreateReportRequest request);
        Task<PagedResult<ReportResponse>> GetAllReportsAsync(int page = 1, int pageSize = 10, string? search = null);
        Task<bool> ResolveReportAsync(Guid reportId, Guid moderatorId, string action); // action = "DaXuLy" | "BacBo"
    }
}
