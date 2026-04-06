using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinanceDashboard.Server.Services;

namespace FinanceDashboard.Server.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _svc;

    public DashboardController(IDashboardService svc) => _svc = svc;

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _svc.GetSummaryAsync();
        return Ok(result);
    }

    [HttpGet("trends")]
    [Authorize(Roles = "Analyst,Admin")]
    public async Task<IActionResult> GetTrends([FromQuery] int months = 6)
    {
        if (months < 1 || months > 24)
            return BadRequest(new { message = "Months must be between 1 and 24." });

        var result = await _svc.GetMonthlyTrendsAsync(months);
        return Ok(result);
    }
}