using Microsoft.EntityFrameworkCore;
using PaymentService.Models;
namespace PaymentService.Data;
public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options) { }

    public DbSet<Subscription> Subscriptions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Subscription>()
            .Property(s => s.Amount)
            .HasPrecision(18, 2);
    }
}

