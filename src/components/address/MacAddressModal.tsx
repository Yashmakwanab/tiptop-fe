"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { MacAddress } from "@/types/macAddress";
import { macAddressApi } from "@/lib/macAddressApi";

interface MacAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: MacAddress | null;
}

export default function MacAddressModal({
  isOpen,
  onClose,
  onSaved,
  editData,
}: MacAddressModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setAddress(editData.address);
    } else {
      setName("");
      setAddress("");
    }
  }, [editData]);

  const handleSave = async () => {
    if (!name || !address) return;

    const payload = {
      name: name,
      address: address,
      created_by: "",
    };

    try {
      if (editData?._id) {
        await macAddressApi.update(editData._id, payload);
      } else {
        await macAddressApi.create(payload);
      }
      onSaved();
      onClose();
      setName("");
      setAddress("");
    } catch (err) {
      console.error("Error saving mac address:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px]">
      <div className="rounded-xl bg-white dark:bg-gray-900 p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editData ? "Edit Mac Address" : "Add Mac Address"}
        </h4>

        <form className="flex flex-col gap-5">
          <div>
            <Label>Mac Address</Label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Add mac address"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11"
            />
          </div>

          <div>
            <Label>Name</Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add name of user"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-3">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!name || !address}
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
