import { apiRequest } from "./authApi";

export async function createDemoRequest(details) {
  const payload = await apiRequest("/public/demo-requests", {
    method: "POST",
    body: JSON.stringify(details),
  });
  return payload.data;
}
