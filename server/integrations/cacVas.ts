export type CacVerificationResult = {
  provider: "CAC_VAS";
  status: "verified" | "not_found" | "inactive" | "mismatch" | "provider_error" | "manual_review";
  entityName?: string;
  entityStatus?: string;
  registrationNumber: string;
  providerReference?: string;
  resultSummary: string;
};

/**
 * CAC VAS is intentionally configuration-driven. The official documentation
 * supplies the provider contract and endpoint details; credentials must be
 * supplied by the project owner and never committed to the repository.
 */
export async function verifyCacBusiness(input: { registrationNumber: string; entityName?: string }): Promise<CacVerificationResult> {
  const baseUrl = process.env.CAC_VAS_BASE_URL;
  const endpoint = process.env.CAC_VAS_VERIFY_ENDPOINT;
  const apiKey = process.env.CAC_VAS_API_KEY;
  if (!baseUrl || !endpoint || !apiKey) {
    return { provider: "CAC_VAS", status: "manual_review", registrationNumber: input.registrationNumber, resultSummary: "CAC VAS is not configured; an administrator must complete the approved manual verification route." };
  }
  try {
    const response = await fetch(new URL(endpoint, baseUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ registrationNumber: input.registrationNumber, entityName: input.entityName }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { provider: "CAC_VAS", status: "provider_error", registrationNumber: input.registrationNumber, resultSummary: `CAC provider returned HTTP ${response.status}.` };
    const body = await response.json() as Record<string, any>;
    const entity = body.cac ?? body.data ?? body.result ?? body;
    const status = String(entity.status ?? body.status ?? "").toLowerCase();
    const entityName = entity.companyName ?? entity.entityName ?? entity.name;
    const verified = body.cac_check === "verified" || body.summary?.cac_check === "verified" || status === "active" || status === "verified";
    const inactive = status === "inactive" || status === "dissolved";
    const mismatch = Boolean(input.entityName && entityName && input.entityName.toLowerCase() !== String(entityName).toLowerCase());
    return { provider: "CAC_VAS", status: mismatch ? "mismatch" : inactive ? "inactive" : verified ? "verified" : "not_found", registrationNumber: input.registrationNumber, entityName, entityStatus: status, providerReference: String(body.id ?? body.reference ?? ""), resultSummary: mismatch ? "The registered name does not match the applicant declaration." : `CAC response received with status: ${status || "unconfirmed"}.` };
  } catch (error) {
    return { provider: "CAC_VAS", status: "provider_error", registrationNumber: input.registrationNumber, resultSummary: `CAC provider request failed: ${error instanceof Error ? error.message : "unknown error"}.` };
  }
}
