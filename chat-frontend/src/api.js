const BASE = import.meta.env.VITE_API_URL || "/api/v1";

const readError = async (res) => {
  let text = "";
  try {
    text = await res.text();
  } catch {
    text = "";
  }
  const looksLikeHtml = text.trim().startsWith("<");
  if (text && !looksLikeHtml && text.length < 200) return text;
  if (res.status === 401) return "Invalid email or password";
  if (res.status === 409) return "Username or email already exists";
  if (res.status === 400) return "Please check the details you entered";
  return "Something went wrong. Try again.";
};

const request = async (path, options) => {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      ...options,
    });
  } catch {
    throw new Error("Cannot reach the server. Check that it is running.");
  }
  if (!res.ok) throw new Error(await readError(res));
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
