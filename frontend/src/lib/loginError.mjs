const BACKEND_UNAVAILABLE =
  "Backend unavailable. Make sure the API is running at http://localhost:8000.";
const INVALID_CREDENTIALS = "Invalid username or password.";

export function getLoginErrorMessage(error) {
  if (!error?.response) {
    return BACKEND_UNAVAILABLE;
  }

  return INVALID_CREDENTIALS;
}
