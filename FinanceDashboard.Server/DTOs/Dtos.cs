using FinanceDashboard.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace FinanceDashboard.Server.DTOs;

// AUTH
public class RegisterDto
{
    [Required] public string Name { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, MinLength(6)] public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

// USER
public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateUserRoleDto
{
    [Required] public UserRole Role { get; set; }
}

public class UpdateUserStatusDto
{
    [Required] public bool IsActive { get; set; }
}

// TRANSACTION
public class CreateTransactionDto
{
    [Required, Range(0.01, double.MaxValue)] public decimal Amount { get; set; }
    [Required] public TransactionType Type { get; set; }
    [Required] public string Category { get; set; } = string.Empty;
    [Required] public DateTime Date { get; set; }
    public string? Notes { get; set; }
}

public class UpdateTransactionDto
{
    public decimal? Amount { get; set; }
    public TransactionType? Type { get; set; }
    public string? Category { get; set; }
    public DateTime? Date { get; set; }
    public string? Notes { get; set; }
}

public class TransactionDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string UserName { get; set; } = string.Empty;
}

public class TransactionFilterDto
{
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public string? Category { get; set; }
    public TransactionType? Type { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

// DASHBOARD
public class DashboardSummaryDto
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetBalance { get; set; }
    public int TotalTransactions { get; set; }
    public List<CategoryTotalDto> CategoryTotals { get; set; } = new();
    public List<TransactionDto> RecentTransactions { get; set; } = new();
}

public class CategoryTotalDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string Type { get; set; } = string.Empty;
}

public class MonthlyTrendDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
    public decimal Net { get; set; }
}