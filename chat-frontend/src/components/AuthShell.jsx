const AuthShell = ({ title, subtitle, children, footer }) => (
  <main className="auth">
    <aside className="auth-art" aria-hidden="true">
      <div className="bubble b1">Did you see the new build?</div>
      <div className="bubble b2 mine">Just pushed it. Check your inbox.</div>
      <div className="bubble b3">On it.</div>
      <div className="bubble b4 mine">Say hi when you are in.</div>
    </aside>
    <section className="auth-panel">
      <div className="auth-card">
        <h1>{title}</h1>
        <p className="sub">{subtitle}</p>
        {children}
        <p className="switch">{footer}</p>
      </div>
    </section>
  </main>
);

export default AuthShell;
