import {
  exchangeCodeForToken,
  redirectToAuthorizeAccess,
} from "@/src/app/authorize/lib/authorization";
import { cookies } from "next/headers";
import FromAuthorizationComponent from "@/src/app/authorize/components/fromAuthorization";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryParams = await searchParams;

  if (!queryParams || !queryParams.code) await redirectToAuthorizeAccess();

  return (
    <>
      <FromAuthorizationComponent />
    </>
  );
}
