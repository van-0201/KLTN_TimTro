using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TimTro_Backend.DTOs;

namespace TimTro_Backend.Services.Transaction
{
    public interface ITransactionService
    {
        Task<TransactionResponse> CreateTransactionAsync(Guid userId, CreateTransactionRequest request);
        Task<PagedResult<TransactionResponse>> GetAllPendingAsync(int page = 1, int pageSize = 10, string? search = null);
        Task<PagedResult<TransactionResponse>> GetMyTransactionsAsync(Guid userId, int page = 1, int pageSize = 10);
        Task<bool> ApproveTransactionAsync(Guid id, Guid adminId, ApproveTransactionRequest request);
        Task<PagedResult<TransactionResponse>> GetHistoryAsync(Guid userId, string role, int page = 1, int pageSize = 10, string? search = null);
    }
}
