"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '🔍', label: 'Search' },
  { href: '/jobs', icon: '📁', label: 'Jobs' },
  { href: '/jobs/create', icon: '➕', label: 'Create WO' },
  { href: '/technicians', icon: '👥', label: 'Technicians' },
  { href: '/compliance', icon: '📊', label: 'Compliance' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`sidebar-icon ${pathname === item.href ? 'active' : ''}`}
          aria-label={item.label}
          title={item.label}
        >
          <span style={{ fontSize: '20px' }}>{item.icon}</span>
        </Link>
      ))}
      <div style={{ marginTop: 'auto' }}>
        <Link href="/settings" className="sidebar-icon" aria-label="Settings" title="Settings">
          <span style={{ fontSize: '20px' }}>⚙️</span>
        </Link>
      </div>
    </aside>
  );
}
