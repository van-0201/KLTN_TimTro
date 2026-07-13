using Microsoft.EntityFrameworkCore;
using TimTro_Backend.Data;
using TimTro_Backend.Services.Auth;
using TimTro_Backend.Services.Cloudinary;
using TimTro_Backend.Services.RoomPost;
using TimTro_Backend.Services.Roommate;
using TimTro_Backend.Services.Appointment;
using TimTro_Backend.Services.Admin;
using TimTro_Backend.Services.Transaction;
using TimTro_Backend.Services.Notification;
using TimTro_Backend.Services.Notification;
using TimTro_Backend.Services.Report;
using System.Globalization;

// Bắt buộc dùng InvariantCulture cho toàn bộ ứng dụng để tránh lỗi parse số thập phân ở các API (ví dụ Vĩ độ, Kinh độ bị parse thành chục triệu tỷ).
CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
CultureInfo.DefaultThreadCurrentUICulture = CultureInfo.InvariantCulture;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
// Add services to the container.
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IRoomPostService, RoomPostService>();
builder.Services.AddScoped<IRoommateService, RoommateService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IReportService, ReportService>();

builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Tạo tài khoản Admin và Moderator mặc định khi khởi động
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        TimTro_Backend.Data.DataSeeder.Initialize(context);

        // Fix invalid coordinates
        context.Database.ExecuteSqlRaw("UPDATE BaiDangPhongTro SET ViDoThucTe = 20.99739, KinhDoThucTe = 105.84645 WHERE MaBaiDang = '969cdbee-e1d8-4722-a6f3-0fe64d32fb4f'");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Lỗi khi Seed Data: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/api/test-connection", () =>
{
    return Results.Ok(new { message = "Kết nối thành công! Frontend và Backend đã thông nhau !" });
});

app.Run();
