using Microsoft.EntityFrameworkCore;
using FinanceDashboard.Server.Data;
using FinanceDashboard.Server.DTOs;
using FinanceDashboard.Server.Models;

namespace FinanceDashboard.Server.Services;

public interface ITransactionService
{
    Task<PagedResult<TransactionDto>> GetAllAsync(TransactionFilterDto filter);
    Task<TransactionDto> GetByIdAsync(int id);
    Task<TransactionDto> CreateAsync(CreateTransactionDto dto, int userId);
    Task<TransactionDto> UpdateAsync(int id, UpdateTransactionDto dto, int userId, string role);
    Task DeleteAsync(int id, int userId, string role);
}

public class TransactionService : ITransactionService
{
    private readonly AppDbContext _db;

    public TransactionService(AppDbContext db) => _db = db;

    public async Task<PagedResult<TransactionDto>> GetAllAsync(TransactionFilterDto filter)
    {
        var query = _db.Transactions
            .Include(t => t.User)
            .AsQueryable();

        if (filter.From.HasValue)
            query = query.Where(t => t.Date >= filter.From.Value);
        if (filter.To.HasValue)
            query = query.Where(t => t.Date <= filter.To.Value);
        if (!string.IsNullOrWhiteSpace(filter.Category))
            query = query.Where(t => t.Category == filter.Category);
        if (filter.Type.HasValue)
            query = query.Where(t => t.Type == filter.Type.Value);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.Date)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(t => MapToDto(t))
            .ToListAsync();

        return new PagedResult<TransactionDto>
        {
            Items = items,
            TotalCount = total,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<TransactionDto> GetByIdAsync(int id)
    {
        var t = await _db.Transactions
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new KeyNotFoundException($"Transaction {id} not found.");
        return MapToDto(t);
    }

    public async Task<TransactionDto> CreateAsync(CreateTransactionDto dto, int userId)
    {
        var t = new Transaction
        {
            Amount = dto.Amount,
            Type = dto.Type,
            Category = dto.Category,
            Date = dto.Date,
            Notes = dto.Notes,
            UserId = userId
        };
        _db.Transactions.Add(t);
        await _db.SaveChangesAsync();
        await _db.Entry(t).Reference(x => x.User).LoadAsync();
        return MapToDto(t);
    }

    public async Task<TransactionDto> UpdateAsync(int id, UpdateTransactionDto dto, int userId, string role)
    {
        var t = await _db.Transactions
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new KeyNotFoundException($"Transaction {id} not found.");

        if (t.UserId != userId && role != "Admin")
            throw new UnauthorizedAccessException("Cannot edit another user's transaction.");

        if (dto.Amount.HasValue) t.Amount = dto.Amount.Value;
        if (dto.Type.HasValue) t.Type = dto.Type.Value;
        if (dto.Category is not null) t.Category = dto.Category;
        if (dto.Date.HasValue) t.Date = dto.Date.Value;
        if (dto.Notes is not null) t.Notes = dto.Notes;

        await _db.SaveChangesAsync();
        return MapToDto(t);
    }

    public async Task DeleteAsync(int id, int userId, string role)
    {
        var t = await _db.Transactions
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new KeyNotFoundException($"Transaction {id} not found.");

        if (t.UserId != userId && role != "Admin")
            throw new UnauthorizedAccessException("Cannot delete another user's transaction.");

        t.IsDeleted = true;
        await _db.SaveChangesAsync();
    }

    private static TransactionDto MapToDto(Transaction t) => new()
    {
        Id = t.Id,
        Amount = t.Amount,
        Type = t.Type.ToString(),
        Category = t.Category,
        Date = t.Date,
        Notes = t.Notes,
        CreatedAt = t.CreatedAt,
        UserName = t.User?.Name ?? ""
    };
}