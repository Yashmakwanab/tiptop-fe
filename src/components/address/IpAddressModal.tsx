"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { IpAddress } from "@/types/ipAddress";
import { ipAddressApi } from "@/lib/ipAddressApi";

interface IpAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: IpAddress | null;
}

export default function IpAddressModal({
  isOpen,
  onClose,
  onSaved,
  editData,
}: IpAddressModalProps) {
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
        await ipAddressApi.update(editData._id, payload);
      } else {
        await ipAddressApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving ip address:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px]">
      <div className="rounded-xl bg-white dark:bg-gray-900 p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editData ? "Edit Ip Address" : "Add Ip Address"}
        </h4>

        <form className="flex flex-col gap-5">
          <div>
            <Label>Ip Address</Label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Add ip address"
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
