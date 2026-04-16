import { AlertTriangle } from "lucide-react";
import { ComingSoon } from "../_components/ComingSoon";

export default function AdminErrorsPage() {
  return <ComingSoon icon={AlertTriangle} title="Error-Logs" desc="Fehlerprotokolle und Exceptions einsehen und debuggen." />;
}
