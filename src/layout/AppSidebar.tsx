"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ChevronDownIcon, HorizontaLDots } from "../icons/index";
import { Employee } from "@/types/employee";
import * as Icons from "@mui/icons-material";
import { menuApi } from "@/lib/menuApi";
import { Menu, MenuQueryParams } from "@/types/menu";

type NavItem = {
  _id?: string;
  name: string;
  icon: string;
  path?: string;
  subItems?: { _id?: string; name: string; path: string }[];
  groupTitle?: boolean;
  order?: number;
};

const getIcon = (iconName: string): React.ReactNode => {
  const IconComponent = (Icons as Record<string, React.ElementType>)[iconName];
  if (!IconComponent) return <Icons.HelpOutline />;
  return <IconComponent />;
};

const AppSidebar: React.FC<{ user: Employee | null }> = ({ user }) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch menu hierarchy
  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const params: MenuQueryParams = { page: 1, limit: 100 };
      const response = await menuApi.getMenuHierarchy(params);
      setMenus(response.data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const userPermissionsMap = React.useMemo(() => {
    if (!user || !user.role) return new Set<string>();

    if (typeof user.role === "object" && "permissions" in user.role) {
      return new Set(user.role.permissions.map((p) => p.menuId));
    }

    return new Set<string>();
  }, [user?.role]);

  const filteredMenus = React.useMemo(() => {
    if (!userPermissionsMap.size) return [];

    const filterMenuByPermission = (menu: Menu): Menu | null => {
      if (!menu._id) {
        return null;
      }

      const hasPermission = userPermissionsMap.has(menu._id);

      if (!hasPermission) {
        return null;
      }

      if (menu.subItems && menu.subItems.length > 0) {
        const filteredSubItems = menu.subItems
          .map((subItem) => filterMenuByPermission(subItem))
          .filter((item): item is Menu => item !== null);

        return { ...menu, subItems: filteredSubItems };
      }

      return menu;
    };

    return menus
      .map((menu) => filterMenuByPermission(menu))
      .filter((item): item is Menu => item !== null);
  }, [menus, user, userPermissionsMap]);

  const navItems = React.useMemo(() => {
    return filteredMenus.map((menu) => ({
      _id: menu._id,
      name: menu.name,
      icon: menu.icon || "HelpOutline",
      path: menu.path || undefined,
      groupTitle: menu.groupTitle || false,
      order: menu.order || 0,
      subItems: menu.subItems?.map((sub) => ({
        _id: sub._id,
        name: sub.name,
        path: sub.path || "",
      })),
    }));
  }, [filteredMenus]);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    navItems.forEach((nav) => {
      if (nav.subItems?.some((sub) => isActive(sub.path))) {
        setOpenSubmenu(nav._id || null);
      }
    });
  }, [pathname, navItems, isActive]);

  const handleSubmenuToggle = (menuId: string) => {
    setOpenSubmenu((prev) => (prev === menuId ? null : menuId));
  };

  const renderMenuItems = (navItems: NavItem[]) => {
    if (navItems.length === 0) {
      return (
        <div className="flex justify-center items-center py-4 text-gray-400 text-sm">
          {isExpanded || isHovered || isMobileOpen ? (
            "No menu items available"
          ) : (
            <Icons.BlockOutlined className="text-gray-400" />
          )}
        </div>
      );
    }

    return (
      <ul className="flex flex-col gap-4">
        {navItems.map((nav) => (
          <li key={nav._id || nav.name}>
            {nav.groupTitle ? (
              <h2
                className={`text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  nav.name
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
            ) : nav.subItems && nav.subItems.length > 0 ? (
              <>
                <button
                  onClick={() => handleSubmenuToggle(nav._id!)}
                  className={`menu-item group ${openSubmenu === nav._id
                    ? "menu-item-active"
                    : "menu-item-inactive"
                    } cursor-pointer ${!isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                    }`}
                >
                  <span
                    className={`${openSubmenu === nav._id
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                      }`}
                  >
                    {getIcon(nav.icon)}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-300 ${openSubmenu === nav._id ? "rotate-180 text-brand-500" : ""
                        }`}
                    />
                  )}
                </button>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <div
                    ref={(el) => {
                      subMenuRefs.current[nav._id!] = el;
                    }}
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      height:
                        openSubmenu === nav._id
                          ? subMenuRefs.current[nav._id!]?.scrollHeight ?? 0
                          : 0,
                    }}
                  >
                    <ul className="mt-2 space-y-1 ml-9">
                      {nav.subItems.map((subItem) => (
                        <li key={subItem._id || subItem.name}>
                          <Link
                            href={subItem.path}
                            className={`menu-dropdown-item ${isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                              }`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${isActive(nav.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                    }`}
                >
                  <span
                    className={`${isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                      }`}
                  >
                    {getIcon(nav.icon)}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
      ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {loading ? (
                <div className="flex justify-center items-center py-4">
                  <span className="text-gray-400 text-sm">
                    {isExpanded || isHovered || isMobileOpen ? (
                      "Loading menus..."
                    ) : (
                      <Icons.HourglassEmptyOutlined className="animate-spin" />
                    )}
                  </span>
                </div>
              ) : (
                renderMenuItems(navItems)
              )}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;