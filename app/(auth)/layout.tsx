export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="center-viewport" style={{ paddingTop: 0 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
