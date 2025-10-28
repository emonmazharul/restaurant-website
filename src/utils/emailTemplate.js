export function emailHTMLTemplate(reservation, restaurantName = "Your Restaurant") {
    console.log(reservation);
  if (!reservation) throw new Error("Reservation data is required.");

  const { fullName, booking_date, booking_time, guests, special_request } = reservation;

  // Format date nicely
  const formattedDate = new Date(booking_date).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Your Table Reservation is Confirmed – ${restaurantName}`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${subject}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        color: #333333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
      }
      h1 {
        color: #2c3e50;
        font-size: 24px;
        margin-bottom: 10px;
      }
      p {
        font-size: 16px;
        line-height: 1.5;
      }
      .details {
        background-color: #f3f3f3;
        padding: 10px 15px;
        border-radius: 6px;
        margin: 15px 0;
      }
      .details p {
        margin: 5px 0;
      }
      .footer {
        font-size: 14px;
        color: #777777;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Reservation Confirmed!</h1>
      <p>Hi <strong>${fullName}</strong>,</p>
      <p>Your table at <strong>${restaurantName}</strong> has been confirmed. Here are your booking details:</p>
      
      <div class="details">
        <p>📅 <strong>Date:</strong> ${formattedDate}</p>
        <p>⏰ <strong>Time:</strong> ${booking_time}</p>
        <p>👥 <strong>Guests:</strong> ${guests}</p>
        ${special_request ? `<p>📝 <strong>Special Request:</strong> ${special_request}</p>` : ""}
      </div>

      <p>We look forward to welcoming you soon! If you need to make any changes, please reply to this email or call us.</p>

      <div class="footer">
        Best regards,<br>
        ${restaurantName} Team
      </div>
    </div>
  </body>
  </html>
  `;

  return { subject, html };
}
