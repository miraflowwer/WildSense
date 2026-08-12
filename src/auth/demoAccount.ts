export const DEMO_EMAIL = 'demo@gahm.org'
export const DEMO_PASSWORD = 'GAHM-demo-2026'
export const DEMO_MODE_HINT =
  'Try the demo — sign in with the shared demo account to explore the scripted 8-event scenario without creating an account.'
export function isDemoCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD
}