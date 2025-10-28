export function generateOrderId() {
  const timestamp = Date.now(); // e.g. 1734720934000
  const random = Math.floor(Math.random() * 10000); // 4 random digits
  return Number(`${timestamp}${random.toString().padStart(4, "0")}`);
}