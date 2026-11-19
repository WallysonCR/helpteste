using System.Text;
using System.Text.Json.Serialization;

using HelpTicket.Api.Data;
using HelpTicket.Api.Models;
using HelpTicket.Api.Repositories;
using HelpTicket.Api.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;


var builder = WebApplication.CreateBuilder(args);


// ========================================
// BANCO DE DADOS (POSTGRESQL OU IN-MEMORY)
// ========================================

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!string.IsNullOrWhiteSpace(connectionString))
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseInMemoryDatabase("HelpTicket");
    }
});


// ========================================
// REPOSITORIES
// ========================================

builder.Services.AddScoped<UsuarioRepository>();
builder.Services.AddScoped<TicketRepository>();
builder.Services.AddScoped<CategoriaRepository>();


// ========================================
// SERVICES
// ========================================

builder.Services.AddSingleton<SystemSettingsState>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TicketService>();


// ========================================
// HASH DE SENHA
// ========================================

builder.Services.AddScoped<
    IPasswordHasher<Usuario>,
    PasswordHasher<Usuario>
>();


// ========================================
// CORS
// ========================================

var corsOrigins = builder.Configuration["Cors:Origins"]
    ?? "http://localhost:5173,https://helpticket.vercel.app";

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.SetIsOriginAllowed(origin =>
                  origin.StartsWith("http://localhost:") ||
                  origin.EndsWith(".vercel.app") ||
                  corsOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Contains(origin))
              .AllowAnyHeader()
              .AllowAnyMethod()
    );
});


// ========================================
// CONTROLLERS / JSON
// ========================================

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions
            .Converters
            .Add(new JsonStringEnumConverter());
    });


// ========================================
// OPENAPI
// ========================================

builder.Services.AddOpenApi();


// ========================================
// JWT
// ========================================

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new Exception("JWT Key não configurada.");

var jwtIssuer = builder.Configuration["Jwt:Issuer"];

var jwtAudience = builder.Configuration["Jwt:Audience"];


builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

                ClockSkew = TimeSpan.Zero
            };
    });


builder.Services.AddAuthorization();


// ========================================
// BUILD
// ========================================

var app = builder.Build();


// ========================================
// OPENAPI
// ========================================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}


// ========================================
// PIPELINE HTTP
// ========================================

app.UseCors("Frontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();


// ========================================
// DADOS INICIAIS
// ========================================

await DbInitializer.InicializarAsync(app.Services);


app.Run();