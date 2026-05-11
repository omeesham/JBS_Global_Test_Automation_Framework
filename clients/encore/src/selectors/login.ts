/**
 * Microsoft SSO Selectors (well-known, stable).
 * Used by LoginPage for authentication flow.
 */
export const MicrosoftLoginSelectors = {
 /** @where Microsoft Login @el input @text "Email" @keys email username sign-in sso */
  txtEmail: 'input[type="email"][name="loginfmt"]',
 /** @where Microsoft Login @el button @text "Next" @keys next continue email-submit */
  btnNext: 'input[type="submit"][value="Next"]',
 /** @where Microsoft Login @el input @text "Password" @keys password credential secret */
  txtPassword: 'input[type="password"][name="passwd"]',
 /** @where Microsoft Login @el button @text "Sign in" @keys sign-in submit login authenticate */
  btnSignIn: 'input[type="submit"][value="Sign in"]',
 /** @where Microsoft Login > Stay Signed In @el button @text "Yes" @keys stay-signed-in remember yes */
  btnYesStaySignedIn: 'input[type="submit"][value="Yes"]',
 /** @where Microsoft Login > Stay Signed In @el button @text "No" @keys stay-signed-in decline no */
  btnNoStaySignedIn: 'input[type="button"][value="No"]',
 /** @where Microsoft Login @el label @text "Error" @keys error username-error password-error validation */
  divError: '#usernameError, #passwordError',
 /** @where Navigator Cloud Sign-In @el button @text "Continue Now" @keys continue-now pre-sso sign-in navigator-cloud */
  btnContinueNow: 'button:has-text("Continue Now")',
} as const;
