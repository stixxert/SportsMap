import React from "react";
import { useParams } from "next/navigation";
import { useSetApiConfiguration } from "@features/authorization/hooks/api-configuration-state";

export default function MapsModeProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { mapMode } = useParams<{ mapMode: string }>();

  const mode = (mapMode || "") as string;

  useSetApiConfiguration(mode);

  return <>{children}</>;
}
