/** Shared consent gate for login, register, and demo flows. */
export function isAuthActionDisabled(acceptedTerms: boolean, loading = false): boolean {
  return loading || !acceptedTerms;
}

export function assertTermsAccepted(acceptedTerms: boolean): void {
  if (!acceptedTerms) {
    throw new Error("TERMS_NOT_ACCEPTED");
  }
}
