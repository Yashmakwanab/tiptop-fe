"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { menuApi } from "@/lib/menuApi";
import { Menu } from "@/types/menu";
import { useAuth } from "@/context/AuthContext";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

interface MenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editData?: Menu | null;
}

export default function MenuModal({
    isOpen,
    onClose,
    onSaved,
    editData,
}: MenuModalProps) {
    const { checkAuth } = useAuth();
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("LocalTaxi");
    const [path, setPath] = useState("");
    const [order, setOrder] = useState(1);
    const [groupTitle, setGroupTitle] = useState(false);
    const [parentId, setParentId] = useState("");
    const [loading, setLoading] = useState(false);

    // Submenu management
    const [hasSubmenus, setHasSubmenus] = useState(false);
    const [submenus, setSubmenus] = useState<Menu[]>([]);

    useEffect(() => {
        if (editData) {
            setName(editData.name);
            setIcon(editData.icon);
            setPath(editData.path || "");
            setOrder(editData.order);
            setGroupTitle(editData.groupTitle || false);
            setParentId(editData.parentId || "");

            // Load existing submenus if any
            if (editData.subItems && editData.subItems.length > 0) {
                setHasSubmenus(true);
                setSubmenus(editData.subItems.map((sub, idx) => ({
                    tempId: sub._id || `temp-${idx}`,
                    _id: sub._id,
                    name: sub.name,
                    icon: sub.icon,
                    path: sub.path || "",
                    order: sub.order,
                    subItems: sub.subItems || [],
                })));
            } else {
                setHasSubmenus(false);
                setSubmenus([]);
            }
        } else {
            resetForm();
        }
    }, [editData]);

    const resetForm = () => {
        setName("");
        setIcon("LocalTaxi");
        setPath("");
        setOrder(1);
        setGroupTitle(false);
        setParentId("");
        setHasSubmenus(false);
        setSubmenus([]);
    };

    const handleNameChange = (value: string) => {
        setName(value);
    };

    const addSubmenu = () => {
        const newSubmenu: Menu = {
            tempId: `temp-${Date.now()}`,
            name: "",
            icon: "",
            path: "",
            order: submenus.length + 1,
            subItems: [],
        };
        setSubmenus([...submenus, newSubmenu]);
    };

    const removeSubmenu = (tempId: string) => {
        setSubmenus(submenus.filter(sub => sub.tempId !== tempId));
    };

    const updateSubmenu = (tempId: string, field: keyof Menu, value: string | number) => {
        setSubmenus(submenus.map(sub => {
            if (sub.tempId === tempId) {
                const updated = { ...sub, [field]: value };
                return updated;
            }
            return sub;
        }));
    };

    const handleSave = async () => {
        if (!name) {
            alert("Please fill in required fields");
            return;
        }

        if (hasSubmenus && submenus.length > 0) {
            const invalidSubmenus = submenus.filter(sub => !sub.name);
            if (invalidSubmenus.length > 0) {
                alert("Please fill in all submenu names");
                return;
            }
        }

        try {
            setLoading(true);

            const payload = {
                parent: {
                    _id: editData?._id,
                    tempId: editData?.tempId || `temp-${Date.now()}`,
                    name,
                    icon,
                    path: (hasSubmenus || groupTitle) ? "" : path,
                    order: order,
                    groupTitle,
                    parentId: parentId || "",
                    subItems: [],
                },
                submenus: hasSubmenus
                    ? submenus.map(sub => ({
                        _id: sub?._id || undefined,
                        tempId: sub.tempId || `temp-${Date.now()}`,
                        name: sub.name,
                        icon: sub.icon || "",
                        path: sub.path,
                        order: sub.order,
                        groupTitle: false,
                        subItems: [],
                    }))
                    : [],
            };

            if (editData?._id) {
                await menuApi.updateMenu(editData?._id, payload);
                checkAuth();
            } else {
                await menuApi.createMenu(payload);
            }

            onSaved();
            onClose();
            resetForm();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px]">
            <div className="rounded-xl bg-white dark:bg-gray-900 p-6 max-h-[90vh] overflow-y-auto">
                <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {editData ? "Edit Menu" : "Add Menu"}
                </h4>

                <div className="flex flex-col gap-5">
                    {/* Main Menu Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <Label>
                                Menu Name <span className="text-red-500">*</span>
                            </Label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Enter menu name"
                                className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <Label>Path (Route)</Label>
                            <input
                                type="text"
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                placeholder="/dashboard"
                                disabled={groupTitle || hasSubmenus}
                                className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11 dark:border-gray-600 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                            />
                            {(groupTitle || hasSubmenus) && (
                                <p className="text-xs text-orange-500 mt-1">Path disabled (has submenus or is group)</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <Label>Icon</Label>
                            <input
                                type="text"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="LocalTaxi, LibraryBooks"
                                className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <div>
                            <Label>Display Order</Label>
                            <input
                                type="number"
                                value={order}
                                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hasSubmenus}
                                disabled={groupTitle}
                                onChange={(e) => {
                                    setHasSubmenus(e.target.checked);
                                    if (e.target.checked) {
                                        setPath("");
                                        if (submenus.length === 0) {
                                            addSubmenu();
                                        }
                                    } else {
                                        setSubmenus([]);
                                    }
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Has Submenus
                                </span>
                                <p className="text-xs text-gray-500">Add child menus under this menu</p>
                            </div>
                        </label>
                    </div>

                    {/* Submenus Section */}
                    {hasSubmenus && (
                        <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                            <div className="flex items-center justify-between mb-3">
                                <h5 className="font-semibold text-gray-800 dark:text-white">Submenus</h5>
                                <Button
                                    size="sm"
                                    onClick={addSubmenu}
                                    className="flex items-center gap-1"
                                >
                                    <AddIcon fontSize="small" />
                                    Add Submenu
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {submenus.map((submenu) => (
                                    <div key={submenu.tempId} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <Label className="text-xs">Submenu Name *</Label>
                                                    <input
                                                        type="text"
                                                        value={submenu.name}
                                                        onChange={(e) => updateSubmenu(submenu.tempId, 'name', e.target.value)}
                                                        placeholder="e.g., Staff"
                                                        className="w-full rounded-md border border-gray-300 bg-transparent px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Path *</Label>
                                                    <input
                                                        type="text"
                                                        value={submenu.path}
                                                        onChange={(e) => updateSubmenu(submenu.tempId, 'path', e.target.value)}
                                                        placeholder="/hr/staff"
                                                        className="w-full rounded-md border border-gray-300 bg-transparent px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-xs">Display Order</Label>
                                                    <input
                                                        type="number"
                                                        value={submenu.order}
                                                        onChange={(e) => updateSubmenu(submenu.tempId, 'order', e.target.value)}
                                                        placeholder="Optional"
                                                        className="w-full rounded-md border border-gray-300 bg-transparent px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeSubmenu(submenu.tempId)}
                                                className="mt-6 text-red-500 hover:text-red-700 p-1"
                                            >
                                                <CloseIcon fontSize="small"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-3 border-t pt-4 dark:border-gray-700">
                        <Button size="sm" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            disabled={!name || loading}
                            onClick={handleSave}
                        >
                            {loading ? "Saving..." : editData ? "Update Menu" : "Create Menu"}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}