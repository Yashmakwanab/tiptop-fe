'use client';

import { useState } from 'react';
import { Employee } from '@/types/employee';;
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Checkbox from '@/components/form/input/Checkbox';
import DatePicker from '@/components/form/date-picker';
import TextArea from '../form/input/TextArea';
import { EyeCloseIcon, EyeIcon } from '@/icons';

interface EmployeeFormProps {
    initialData?: Employee;
    onSubmit: (data: Partial<Employee>) => Promise<void>;
    loading: boolean;
}

const AVAILABLE_ROLES = [
    'DASHBOARD',
    'CUSTOMERS',
    'DRIVERS',
    'DRIVERAPPLICATIONSPENDING',
    'DOCSUPDATED',
    'BOOKINGS',
    'VEHICLES',
    'STAFF',
    'SURCHARGE',
    'PROFILE',
    'ROSTERSLOT',
    'STAFFROSTER',
];

export default function EmployeeForm({
    initialData,
    onSubmit,
    loading,
}: EmployeeFormProps) {
    const [formData, setFormData] = useState<Partial<Employee>>(
        initialData || {
            firstName: '',
            lastName: '',
            emailAddress: '',
            password: '',
            associates: '',
            roles: [],
            full_name: '',
            user_name: '',
            user_name_id: '',
            address: '',
            country: '',
            user_email: '',
            user_phone: '',
            emergency_contact_name: '',
            emergency_contact: '',
            relationship: '',
            aadhar_no: '',
            google_play_id: '',
            bank_name: '',
            bank_account_no: '',
            bank_ifsc_no: '',
            joining_date: '',
            work_status: 'Working',
            resigned_date: '',
            monthlySalary: '',
            date_of_birth: '',
            category: '',
            identityProofDoc: '',
            workExperienceDoc: '',
            educationCertificateDoc: '',
            paySlipsDoc: '',
            isSuperAdmin: false,
        }
    );

    const [selectedRoles, setSelectedRoles] = useState<string[]>(initialData?.roles || []);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRoleToggle = (role: string) => {
        setSelectedRoles((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Create payload with roles
        const payload: Partial<Employee> = {
            ...formData,
            roles: selectedRoles,
        };

        if (initialData) {
            if (initialData.password === formData.password) {
                delete payload.password;
            }
        } else {
            // If creating: password is required
            if (!formData.password || formData.password.trim() === '') {
                alert('Password is required for new employees');
                return;
            }
        }
        
        await onSubmit(payload);
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <ComponentCard title="Personal Information">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Username *</Label>
                            <Input
                                type="text"
                                name="user_name"
                                value={formData.user_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label>Office First Name *</Label>
                            <Input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <Label>Office Last Name *</Label>
                            <Input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <Label>Full Name *</Label>
                            <Input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <Label>Office Email Address *</Label>
                            <Input
                                type="email"
                                name="emailAddress"
                                value={formData.emailAddress}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label>Date of Birth *</Label>
                            <DatePicker
                                id="dob"
                                label=""
                                placeholder="Select date"
                                onChange={(dates, currentDateString) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        date_of_birth: currentDateString,
                                    }))
                                }
                                defaultDate={formData.date_of_birth || ''}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Label>Address *</Label>
                            <TextArea
                                value={formData.address}
                                onChange={(value: string) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        address: value,
                                    }))
                                }
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label>Aadhar Number</Label>
                            <Input
                                type="text"
                                name="aadhar_no"
                                value={formData.aadhar_no}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <Label>
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Enter password (min 6 characters)"
                                    minLength={6}
                                    className='pr-[45px]'
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                >
                                    {showPassword ? (
                                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                    ) : (
                                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                    )}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Minimum 6 characters required
                            </p>
                        </div>
                        <div className="mt-4">
                            <Label>Is Super Admin</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                <Checkbox
                                    checked={formData.isSuperAdmin || false}
                                    onChange={(val) =>
                                        setFormData((prev) => ({ ...prev, isSuperAdmin: val }))
                                    }
                                    label={"Admin"}
                                />
                            </div>
                        </div>
                    </div>
                </ComponentCard>

                {/* Contact Information */}
                <ComponentCard title="Contact Information">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>User Email *</Label>
                            <Input
                                type="email"
                                name="user_email"
                                value={formData.user_email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label>Phone Number *</Label>
                            <Input
                                type="tel"
                                name="user_phone"
                                value={formData.user_phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label>Emergency Contact *</Label>
                            <Input
                                type="tel"
                                name="emergency_contact"
                                value={formData.emergency_contact}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label>Emergency Contact Name</Label>
                            <Input
                                type="text"
                                name="emergency_contact_name"
                                value={formData.emergency_contact_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>Relationship With *</Label>
                            <Select
                                options={[
                                    { value: 'Father', label: 'Father' },
                                    { value: 'Mother', label: 'Mother' },
                                    { value: 'Husband', label: 'Husband' },
                                    { value: 'Spouse', label: 'Spouse' },
                                    { value: 'Son', label: 'Son' },
                                    { value: 'Daughter', label: 'Daughter' },
                                    { value: 'Friend', label: 'Friend' },
                                    { value: 'Relatives', label: 'Relatives' },
                                ]}
                                placeholder="Select relation"
                                onChange={(val) =>
                                    setFormData((prev) => ({ ...prev, relationship: val }))
                                }
                                defaultValue={formData.relationship || ''}
                            />
                        </div>
                        <div>
                            <Label>Country *</Label>
                            <Input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                </ComponentCard>

                {/* Employment Information */}
                <ComponentCard title="Employment Information">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Associates *</Label>
                            <Select
                                options={[
                                    { value: 'Tiptop Group', label: 'Tiptop Group' },
                                    { value: 'myguardian ', label: 'myguardian ' },
                                ]}
                                placeholder="Associates"
                                onChange={(val) =>
                                    setFormData((prev) => ({ ...prev, associates: val }))
                                }
                                defaultValue={formData.associates || ''}
                            />
                        </div>
                        <div>
                            <Label>Joining Date *</Label>
                            <DatePicker
                                id="joining_date"
                                label=""
                                placeholder="Select joining date"
                                onChange={(dates, currentDateString) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        joining_date: currentDateString,
                                    }))
                                }
                                defaultDate={formData.joining_date || ''}
                            />
                        </div>
                        <div>
                            <Label>Work Status *</Label>
                            <Select
                                options={[
                                    { value: 'Working', label: 'Working' },
                                    { value: 'Resigned', label: 'Resigned' },
                                    { value: 'Terminated', label: 'Terminated' },
                                ]}
                                placeholder="Select status"
                                onChange={(val) =>
                                    setFormData((prev) => ({ ...prev, work_status: val }))
                                }
                                defaultValue={formData.work_status || ''}
                            />
                        </div>
                        {formData.work_status !== 'Working' && (
                            <div>
                                <Label>Resigned Date</Label>
                                <DatePicker
                                    id="resigned_date"
                                    label=""
                                    placeholder="Select resigned date"
                                    onChange={(dates, currentDateString) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            resigned_date: currentDateString,
                                        }))
                                    }
                                    defaultDate={formData.resigned_date || ''}
                                />
                            </div>
                        )}
                        <div>
                            <Label>Monthly Salary *</Label>
                            <Input
                                type="number"
                                name="monthlySalary"
                                value={formData.monthlySalary}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label>Category *</Label>
                            <Input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label>Google Play ID</Label>
                            <Input
                                type="text"
                                name="google_play_id"
                                value={formData.google_play_id}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Roles */}
                    <div className="mt-4">
                        <Label>Roles</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {AVAILABLE_ROLES.map((role) => (
                                <Checkbox
                                    key={role}
                                    checked={selectedRoles.includes(role)}
                                    onChange={() => handleRoleToggle(role)}
                                    label={role}
                                    disabled={loading}
                                />
                            ))}
                        </div>
                    </div>
                </ComponentCard>

                {/* Bank Information */}
                <ComponentCard title="Bank Information">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Bank Name *</Label>
                            <Input
                                type="text"
                                name="bank_name"
                                value={formData.bank_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label>Bank Account Number *</Label>
                            <Input
                                type="text"
                                name="bank_account_no"
                                value={formData.bank_account_no}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label>Bank IFSC Code *</Label>
                            <Input
                                type="text"
                                name="bank_ifsc_no"
                                value={formData.bank_ifsc_no}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </ComponentCard>

                {/* Documents */}
                <ComponentCard title="Documents">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Identity Proof Document URL</Label>
                            <Input
                                type="text"
                                name="identityProofDoc"
                                value={formData.identityProofDoc}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>Work Experience Document URL</Label>
                            <Input
                                type="text"
                                name="workExperienceDoc"
                                value={formData.workExperienceDoc}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>Education Certificate URL</Label>
                            <Input
                                type="text"
                                name="educationCertificateDoc"
                                value={formData.educationCertificateDoc}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>Pay Slips Document URL</Label>
                            <Input
                                type="text"
                                name="paySlipsDoc"
                                value={formData.paySlipsDoc}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </ComponentCard>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg px-5 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-5 py-2 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : initialData ? 'Update Employee' : 'Create Employee'}
                    </button>
                </div>
            </form>
        </div>
    );
}
