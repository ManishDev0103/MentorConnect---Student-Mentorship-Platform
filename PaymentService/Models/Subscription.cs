namespace PaymentService.Models;

public class Subscription
{
	public int Id { get; set; }

	public long StudentId { get; set; }
	public int PlanId { get; set; }

	public decimal Amount { get; set; }

	public string RazorpayOrderId { get; set; } = "";
	public string RazorpayPaymentId { get; set; } = "";

	public string Status { get; set; } = "ACTIVE";

	public DateTime StartDate { get; set; }
	public DateTime EndDate { get; set; }
}
