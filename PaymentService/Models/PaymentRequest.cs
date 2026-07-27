namespace PaymentService.Models;
public class PaymentRequest
{
    public long StudentId { get; set; }
    public int PlanId { get; set; }
    public long? SessionId { get; set; }
    public decimal Amount { get; set; }
}
