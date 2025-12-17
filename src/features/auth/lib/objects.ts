import { OAUTH_AUTHORIZE_URL } from "@config/api-urls";
import { assembleUrl } from "@utils/url";

const authorizeParams = {
  client_id: process.env.NEXT_PUBLIC_CLIENT_ID || "",
  response_type: "code",
  redirect_uri: process.env.NEXT_PUBLIC_DOMAIN + "/authorize" || "",
  approval_prompt: "auto",
  scope: "activity:read,activity:read_all",
} as const;

export const AUTHORIZE_URL = assembleUrl(OAUTH_AUTHORIZE_URL, authorizeParams);
