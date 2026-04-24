export function ManagerTable({ rows }: { rows: any[] }) {
  return (
    <div className="card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">Staff</th><th align="left">Role</th><th align="left">Avg</th><th align="left">Status</th><th align="left">Failures</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid rgba(14,42,55,.08)" }}>
              <td>{r.name}</td><td>{r.role}</td><td>{r.average_score ?? "-"}</td><td>{r.certification_status}</td><td>{r.failed_scenarios ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
