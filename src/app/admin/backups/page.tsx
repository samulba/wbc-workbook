import { DatabaseBackup } from "lucide-react";
import { ComingSoon } from "../_components/ComingSoon";

export default function AdminBackupsPage() {
  return <ComingSoon icon={DatabaseBackup} title="Backups" desc="Datenbank-Backups verwalten und wiederherstellen." />;
}
