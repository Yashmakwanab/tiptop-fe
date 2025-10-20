"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { roleApi } from "@/lib/roleApi";
import Button from "@/components/ui/button/Button";
import { ArrowLeft } from "lucide-react";
import PermissionMatrix from "@/components/role/AssignPermission";
import Spinner from "@/components/ui/spinner";
import { Role } from "@/types/role";
import { useAuth } from "@/context/AuthContext";

export default function RolePermissionsPage() {
    const params = useParams();
    const router = useRouter();
    const roleId = params.id as string;
    const [role, setRole] = useState<Role>();
    const [loading, setLoading] = useState(true);
    const { checkAuth } = useAuth();

    const fetchRole = useCallback(async () => {
        try {
            setLoading(true);
            const data = await roleApi.getRoleById(roleId);
            setRole(data);
        } catch (error) {
            console.error("Failed to fetch role:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (roleId) {
            fetchRole();
        }
    }, [roleId, fetchRole]);

    const handlePermissionsSaved = () => {
        router.push('/settings/role-permisions');
        checkAuth();
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-124px)] flex items-center justify-center text-xl">
                <Spinner />
            </div>
        );
    }

    if (!role) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        Role not found
                    </h2>
                    <Button onClick={() => router.push("/settings/role-permisions")}>
                        Back to Roles
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => router.push("/settings/role-permisions")}
                    className="mb-4"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Roles
                </Button>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Manage Permissions
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Role: <span className="font-semibold">{role.name}</span>
                </p>
            </div>

            {/* Permission Matrix Component */}
            <PermissionMatrix roleId={roleId} onSaved={handlePermissionsSaved} initialSelectedIds={new Set(role?.permissions?.map((p) => p.menuId))} />
        </div>
    );
}