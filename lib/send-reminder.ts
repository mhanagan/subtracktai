export async function sendReminderEmail(subscription: any, userEmail: string) {
  try {
    const response = await fetch("/api/send-reminder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscription, userEmail }),
    });

    if (!response.ok) {
      throw new Error("Failed to send reminder email");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending reminder email:", error);
    throw error;
  }
}