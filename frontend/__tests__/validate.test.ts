import { isValidEmail, isStrongPassword, doPasswordsMatch } from "../src/utils/validate";

describe("form validation utilities", () => {
  test("valid email patterns", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("bademail@com")).toBe(false);
    expect(isValidEmail(" another@space.com ")).toBe(true);
  });

  test("strong password rules", () => {
    expect(isStrongPassword("Abc12345")).toBe(true);
    expect(isStrongPassword("password")).toBe(false);
    expect(isStrongPassword("ABCD123")).toBe(true);
  });

  test("passwords match check", () => {
    expect(doPasswordsMatch("Secret123", "Secret123")).toBe(true);
    expect(doPasswordsMatch("Secret123", "secret123")).toBe(false);
  });
});
