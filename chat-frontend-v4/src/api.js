const BASE = import.meta.env.VITE_API_URL || "/api/v1";

const readError = async (res) => {
  let text = "";
  try {
    text = await res.text();
  } catch {
    text = "";
  }
  let message = "";
  try {
    message = JSON.parse(text).message || "";
  } catch {
    message = "";
  }
  if (typeof message === "string" && message) return message;
  const looksLikeHtml = text.trim().startsWith("<");
  if (text && !looksLikeHtml && text.length < 200) return text;
  if (res.status === 401) return "Invalid email or password";
  if (res.status === 409) return "Username or email already exists";
  if (res.status === 400) return "Please check the details you entered";
  return "Something went wrong. Try again.";
};

let refreshing = null;

const refreshAccess = () => {
  if (!refreshing) {
    refreshing = fetch(`${BASE}/refreshAccessToken`, { credentials: "include" })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

const NO_REFRESH = ["/", "/register", "/refreshAccessToken"];

const request = async (path, options, canRetry = true) => {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      ...options,
    });
  } catch {
    const error = new Error("Cannot reach the server. Check that it is running.");
    error.status = 0;
    throw error;
  }
  if (res.status === 401 && canRetry && !NO_REFRESH.includes(path)) {
    const refreshed = await refreshAccess();
    if (refreshed) return request(path, options, false);
  }
  if (!res.ok) {
    const error = new Error(await readError(res));
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export const loginRequest = (email, password) =>
  request("/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

export const registerRequest = (formData) =>
  request("/register", {
    method: "POST",
    body: formData,
  });

export const getUsersRequest = (search = "") =>
  request(search ? `/getUsers?search=${encodeURIComponent(search)}` : "/getUsers");

export const getConversationsRequest = () => request("/getMyConversations");

export const createConversationRequest = (receiverId) =>
  request(`/createOrGetConversation/${receiverId}`, { method: "POST" });

export const getMessagesRequest = (conversationId) =>
  request(`/getMessage/${conversationId}`);

export const sendMessageRequest = (conversationId, text) =>
  request(`/sendMessage/${conversationId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

export const refreshAccessRequest = () => refreshAccess();
