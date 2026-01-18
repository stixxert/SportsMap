export type Result<SuccessType, ErrorType> =
  | { success: true; value: SuccessType }
  | { success: false; error: ErrorType };

export type AccessToken = {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
};

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;
