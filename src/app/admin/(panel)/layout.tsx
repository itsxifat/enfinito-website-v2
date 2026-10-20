import { AdminShell } from "@/components/admin/AdminShell";
import { requireUser } from "@/lib/server/auth";
import { countNewMessages } from "@/lib/server/data/messages";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireUser();
  const newMessages = await countNewMessages();
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }} newMessages={newMessages}>
      {children}
    </AdminShell>
  );
}
