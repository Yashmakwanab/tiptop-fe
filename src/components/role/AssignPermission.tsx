"use client";

import { useState, useEffect, useCallback } from "react";
import { roleApi } from "@/lib/roleApi";
import { Menu, MenuQueryParams } from "@/types/menu";
import { menuApi } from "@/lib/menuApi";
import Checkbox from "../form/input/Checkbox";
import Spinner from "../ui/spinner";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface PermissionMatrixProps {
    roleId: string;
    onSaved?: () => void;
    initialSelectedIds?: Set<string>;
}

export default function PermissionMatrix({ roleId, onSaved, initialSelectedIds }: PermissionMatrixProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelectedIds ?? new Set());
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const fetchMenus = useCallback(async () => {
        try {
            setLoading(true);
            const params: MenuQueryParams = { page: 1, limit: 100 };
            const response = await menuApi.getMenuHierarchy(params);
            setMenus(response.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMenus();
    }, [fetchMenus]);

    const getAllChildIds = (menu: Menu): string[] => {
        const ids: string[] = [];
        if (menu.subItems && menu.subItems.length > 0) {
            menu.subItems.forEach((child) => {
                ids.push(child._id!, ...getAllChildIds(child));
            });
        }
        return ids;
    };

    const toggleMenu = (menu: Menu) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            const childIds = getAllChildIds(menu);
            const allIds = [menu._id, ...childIds];
            const isSelected = newSet.has(menu._id!);

            if (isSelected) {
                allIds.forEach((id) => newSet.delete(id!));
            } else {
                allIds.forEach((id) => newSet.add(id!));
            }
            return newSet;
        });
    };

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const savePermissions = async () => {
        try {
            const payload = {
                roleId,
                permissions: Array.from(selectedIds).map((menuId) => (menuId)),
            };

            await roleApi.assignPermissions(payload);
            onSaved?.();
        } catch (err) {
            console.error("Failed to save permissions", err);
        }
    };

    const renderMenu = (menu: Menu, level = 0) => {
        const hasChildren = menu.subItems && menu.subItems.length > 0;
        const isExpanded = expandedIds.has(menu._id!);

        return (
            <div key={menu._id} className="space-y-1">
                <div className="flex items-center space-x-2 pl-4" style={{ paddingLeft: `${level * 20}px` }}>
                    {hasChildren && (
                        <button onClick={() => toggleExpand(menu._id!)} className="focus:outline-none">
                            {isExpanded ? <KeyboardArrowDownIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                        </button>
                    )}
                    {!hasChildren && <div className="w-4" />}
                    <Checkbox
                        checked={selectedIds.has(menu._id!)}
                        onChange={() => toggleMenu(menu)}
                        className="cursor-pointer"
                    />
                    <span>{menu.name}</span>
                </div>

                {hasChildren && isExpanded && (
                    <div className="mt-1">
                        {menu.subItems!.map((child) => renderMenu(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className="min-h-[calc(100vh-124px)] flex items-center justify-center text-xl">
        <Spinner />
    </div>;

    return (
        <div className="space-y-2 border p-4 rounded shadow-sm bg-white dark:bg-gray-800">
            {menus.map((menu) => renderMenu(menu))}
            <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-5 py-2 disabled:opacity-50"
                onClick={savePermissions}
            >
                Save Permissions
            </button>
        </div>
    );
}
