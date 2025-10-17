export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="center-viewport auth-layout" style={{ paddingTop: 0 }}>
      {children}
    </main>
  );
}
