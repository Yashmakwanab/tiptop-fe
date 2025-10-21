"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { roleApi } from "@/lib/roleApi";

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editData?: { _id?: string, name: string; isActive: boolean } | null;
}

export default function RoleModal({
    isOpen,
    onClose,
    onSaved,
    editData,
}: RoleModalProps) {
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState("active");

    useEffect(() => {
        if (editData) {
            setName(editData.name);
            setIsActive(editData.isActive ? "active" : "inactive");
        } else {
            setName("");
        }
    }, [editData]);

    const handleSave = async () => {
        if (!name) return;

        const payload = {
            name: name,
            isActive: isActive === "active",
        };

        try {
            if (editData?._id) {
                await roleApi.updateRole(editData._id, payload);
            } else {
                await roleApi.createRole(payload);
            }
            onSaved();
            onClose();
            setName("");
        } catch (err) {
            console.error("Error saving roster:", err);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px]">
            <div className="rounded-xl bg-white dark:bg-gray-900 p-6">
                <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {editData ? "Edit Role" : "Add Role"}
                </h4>

                <form className="flex flex-col gap-5">
                    <div>
                        <Label>Name</Label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Add role name"
                            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11"
                        />
                    </div>

                    <div>
                        <Label>Start Time*</Label>
                        <select
                            value={isActive}
                            onChange={(e) => setIsActive(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-3">
                        <Button size="sm" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            disabled={!name}
                            onClick={handleSave}
                        >
                            {editData ? "Update" : "Save"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
