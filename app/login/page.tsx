import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="container" style={{ maxWidth: 520, paddingTop: "12vh" }}>
      <div className="card">
        <h1>DR. COSTI EXPERIENCE SIMULATOR</h1>
        <p className="muted">Private training portal for luxury consultation execution.</p>
        <form className="grid" action="/dashboard">
          <label>Email<input name="email" type="email" required style={{ width: "100%", padding: ".6rem" }} /></label>
          <label>Password<input name="password" type="password" required style={{ width: "100%", padding: ".6rem" }} /></label>
          <button className="btn btn-gold" type="submit">Login</button>
        </form>
        <p className="muted" style={{ marginTop: 12 }}>Manager? <Link href="/manager">Go to manager dashboard</Link></p>
      </div>
    </main>
  );
}
