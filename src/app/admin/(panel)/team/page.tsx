import { Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { TeamForm } from "@/components/admin/TeamForm";
import { ConfirmSubmit } from "@/components/admin/ui/ConfirmSubmit";
import { Badge, Card, PageHeader, SplitLayout } from "@/components/admin/ui/Layout";
import table from "@/components/admin/ui/Table.module.css";
import { requireUser } from "@/lib/server/auth";
import { listTeam } from "@/lib/server/data/users";
import { formatDateTime, initials, timeAgo } from "@/lib/format";
import { addTeamMember, removeTeamMember } from "./actions";
import styles from "./team.module.css";

export const instant = false;
export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const user = await requireUser();
  const team = await listTeam();
  const isOwner = user.role === "owner";

  return (
    <>
      <PageHeader title="Team" description="People who can sign in to this admin panel." />
      <SplitLayout
        main={
          <Card flush title={`${team.length} ${team.length === 1 ? "member" : "members"}`}>
            <div className={table.scroll}>
              <table className={table.table}>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th className={table.hideMobile}>Last sign-in</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className={styles.member}>
                          <span className={styles.avatar} aria-hidden="true">
                            {initials(m.name)}
                          </span>
                          <span className={styles.memberText}>
                            <span className={table.primary}>
                              {m.name}
                              {m.id === user.id ? <span className={styles.you}> (you)</span> : null}
                            </span>
                            <span className={table.secondary}>{m.email}</span>
                          </span>
                        </div>
                      </td>
                      <td>{m.role === "owner" ? <Badge tone="blue">Owner</Badge> : <Badge>Admin</Badge>}</td>
                      <td className={`${table.secondary} ${table.hideMobile}`} title={m.lastLoginAt ? formatDateTime(m.lastLoginAt) : undefined}>
                        {m.lastLoginAt ? timeAgo(m.lastLoginAt) : "Never"}
                      </td>
                      <td>
                        <div className={table.actions}>
                          {isOwner && m.role !== "owner" ? (
                            <form action={removeTeamMember.bind(null, m.id)}>
                              <ConfirmSubmit
                                variant="ghost"
                                size="icon"
                                aria-label={`Remove ${m.name}`}
                                title={`Remove ${m.name}?`}
                                description="They'll lose access to the admin panel immediately and be signed out everywhere."
                                confirmLabel="Remove"
                              >
                                <Trash2 size={16} aria-hidden="true" />
                              </ConfirmSubmit>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        }
        aside={
          isOwner ? (
            <Card title="Add a team member" description="They get full access to manage the website.">
              <TeamForm action={addTeamMember} />
            </Card>
          ) : (
            <Card title="Managing the team">
              <p className={styles.note}>Only the owner can add or remove team members.</p>
            </Card>
          )
        }
      />
    </>
  );
}
