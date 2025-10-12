"use client";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!pathname) return;

    // Get first path segment (e.g. '/docs-updated/edit' → 'docs-updated')
    const firstSegment = pathname.split('/')[1] || '';

    // Normalize path: remove hyphens, make uppercase (e.g. 'docs-updated' → 'DOCSUPDATED')
    const normalizedPath = firstSegment.replace(/-/g, '').toUpperCase();

    // Normalize all roles the same way
    const normalizedRoles = user && user.roles.map((role) => role.replace(/-/g, '').toUpperCase()) || []; 

    // Check if allowed
    const hasAccess = normalizedRoles.includes(normalizedPath);

    if (!hasAccess) {
      router.push('/');
    }
  }, [pathname, user, router]);

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar user={user} />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
