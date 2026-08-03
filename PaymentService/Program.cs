using Microsoft.EntityFrameworkCore;
using PaymentService.Data;

var builder = WebApplication.CreateBuilder(args);

// ==========================
// ✅ SERVICES CONFIGURATION
// ==========================

// Controllers (IMPORTANT for PaymentController)
builder.Services.AddControllers();


// https client for razorpay api calling
builder.Services.AddHttpClient();

// MSSQL Database
builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("PaymentDB")));

// CORS (for React)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



var app = builder.Build();

// ==========================
// ✅ MIDDLEWARE PIPELINE
// ==========================

// Swagger UI
app.UseSwagger();
app.UseSwaggerUI();

// CORS
app.UseCors("AllowAll");

// Controllers
app.MapControllers();



// Default test endpoint
app.MapGet("/weatherforecast", () =>
{
    return Enumerable.Range(1, 5)
        .Select(i => new WeatherForecast(
            DateOnly.FromDateTime(DateTime.Now.AddDays(i)),
            Random.Shared.Next(-20, 55),
            "Warm"))
        .ToArray();
})
.WithOpenApi();

// Run Payment Service with dynamic port from configuration or environment
var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") 
    ?? builder.Configuration["Kestrel:Endpoints:Http:Url"] 
    ?? "http://localhost:5083";
app.Run(urls);

// ==========================
// RECORD TYPE
// ==========================
record WeatherForecast(DateOnly Date, int TemperatureC, string Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
