import assert from "node:assert/strict";
import { getLoginErrorMessage } from "./loginError.mjs";

assert.equal(
  getLoginErrorMessage({ request: {}, message: "Network Error" }),
  "Backend unavailable. Make sure the API is running at http://localhost:8000."
);

assert.equal(
  getLoginErrorMessage({ response: { status: 401 } }),
  "Invalid username or password."
);

console.log("login error messages ok");
