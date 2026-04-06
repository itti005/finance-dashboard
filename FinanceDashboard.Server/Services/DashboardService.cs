using Microsoft.EntityFrameworkCore;
using FinanceDashboard.Server.Data;
using FinanceDashboard.Server.DTOs;
using FinanceDashboard.Server.Models;

namespace FinanceDashboard.Server.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
    Task<List<MonthlyTrendDto>> GetMonthlyTrendsAsync(int months);
}

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db) => _db = db;

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var transactions = await _db.Transactions
            .Include(t => t.User)
            .ToListAsync();

        var income = transactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.Amount);

        var expenses = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.Amount);

        var categoryTotals = transactions
            .GroupBy(t => new { t.Category, t.Type })
            .Select(g => new CategoryTotalDto
            {
                Category = g.Key.Category,
                Type = g.Key.Type.ToString(),
                Total = g.Sum(t => t.Amount)
            })
            .OrderByDescending(c => c.Total)
            .ToList();

        var recent = transactions
            .OrderByDescending(t => t.Date)
            .Take(5)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Type = t.Type.ToString(),
                Category = t.Category,
                Date = t.Date,
                Notes = t.Notes,
                CreatedAt = t.CreatedAt,
                UserName = t.User?.Name ?? ""
            })
            .ToList();

        return new DashboardSummaryDto
        {
            TotalIncome = income,
            TotalExpenses = expenses,
            NetBalance = income - expenses,
            TotalTransactions = transactions.Count,
            CategoryTotals = categoryTotals,
            RecentTransactions = recent
        };
    }

    public async Task<List<MonthlyTrendDto>> GetMonthlyTrendsAsync(int months = 6)
    {
        var from = DateTime.UtcNow.AddMonths(-months + 1);
        var transactions = await _db.Transactions
            .Where(t => t.Date >= from)
            .ToListAsync();

        var grouped = transactions
            .GroupBy(t => new { t.Date.Year, t.Date.Month })
            .OrderBy(g => g.Key.Year)
            .ThenBy(g => g.Key.Month)
            .Select(g =>
            {
                var inc = g.Where(t => t.Type == TransactionType.Income)
                           .Sum(t => t.Amount);
                var exp = g.Where(t => t.Type == TransactionType.Expense)
                           .Sum(t => t.Amount);
                return new MonthlyTrendDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    MonthName = new DateTime(g.Key.Year, g.Key.Month, 1)
                        .ToString("MMM yyyy"),
                    Income = inc,
                    Expenses = exp,
                    Net = inc - exp
                };
            })
            .ToList();

        return grouped;
    }
}