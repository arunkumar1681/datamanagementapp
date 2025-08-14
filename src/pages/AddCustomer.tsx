import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

interface CustomerForm {
  salesPerson: string;
  supportPerson: string;
  storeName: string;
  customerEmail: string;
  customerPhone: string;
  accountId: string;
  outletId: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  gstin: string;
  signupDate: string;
  signupPack: string;
  currentPlan: string;
  validityTill: string;
  nextRenewalOn: string;
  channelPartner: string;
  status: string;
  category: string;
  productName: string;
  paidPackAmount: number;
  paidSmsAmount: number;
  paidWaAmount: number;
}

export const AddCustomer: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerForm>({
    salesPerson: '',
    supportPerson: '',
    storeName: '',
    customerEmail: '',
    customerPhone: '',
    accountId: '',
    outletId: '',
    addressLine: '',
    city: '',
    state: '',
    country: '',
    gstin: '',
    signupDate: '',
    signupPack: '',
    currentPlan: '',
    validityTill: '',
    nextRenewalOn: '',
    channelPartner: '',
    status: 'Active',
    category: '',
    productName: '',
    paidPackAmount: 0,
    paidSmsAmount: 0,
    paidWaAmount: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Amount') ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Customer added successfully!');
        navigate('/customers');
      } else {
        alert('Failed to add customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Error adding customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/customers"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Link>
        <div className="border-l border-gray-300 h-6"></div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  required
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Email *
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Phone *
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  required
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
                    Account ID *
                  </label>
                  <input
                    type="text"
                    id="accountId"
                    name="accountId"
                    required
                    value={formData.accountId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="outletId" className="block text-sm font-medium text-gray-700 mb-1">
                    Outlet ID *
                  </label>
                  <input
                    type="text"
                    id="outletId"
                    name="outletId"
                    required
                    value={formData.outletId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 mb-1">
                  GSTIN
                </label>
                <input
                  type="text"
                  id="gstin"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="addressLine" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line *
                </label>
                <textarea
                  id="addressLine"
                  name="addressLine"
                  required
                  rows={3}
                  value={formData.addressLine}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sales Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="salesPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Person *
                </label>
                <input
                  type="text"
                  id="salesPerson"
                  name="salesPerson"
                  required
                  value={formData.salesPerson}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="supportPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  Support Person
                </label>
                <input
                  type="text"
                  id="supportPerson"
                  name="supportPerson"
                  value={formData.supportPerson}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="channelPartner" className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Partner
                </label>
                <input
                  type="text"
                  id="channelPartner"
                  name="channelPartner"
                  value={formData.channelPartner}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="Premium">Premium</option>
                    <option value="Standard">Standard</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Plan & Billing Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan & Billing</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="signupPack" className="block text-sm font-medium text-gray-700 mb-1">
                  Signup Pack
                </label>
                <input
                  type="text"
                  id="signupPack"
                  name="signupPack"
                  value={formData.signupPack}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="currentPlan" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Plan *
                </label>
                <input
                  type="text"
                  id="currentPlan"
                  name="currentPlan"
                  required
                  value={formData.currentPlan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="validityTill" className="block text-sm font-medium text-gray-700 mb-1">
                    Validity Till
                  </label>
                  <input
                    type="date"
                    id="validityTill"
                    name="validityTill"
                    value={formData.validityTill}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="nextRenewalOn" className="block text-sm font-medium text-gray-700 mb-1">
                    Next Renewal On
                  </label>
                  <input
                    type="date"
                    id="nextRenewalOn"
                    name="nextRenewalOn"
                    value={formData.nextRenewalOn}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="paidPackAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Pack Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="paidPackAmount"
                    name="paidPackAmount"
                    min="0"
                    step="0.01"
                    value={formData.paidPackAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="paidSmsAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    SMS Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="paidSmsAmount"
                    name="paidSmsAmount"
                    min="0"
                    step="0.01"
                    value={formData.paidSmsAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="paidWaAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    WA Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="paidWaAmount"
                    name="paidWaAmount"
                    min="0"
                    step="0.01"
                    value={formData.paidWaAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/customers"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Customer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};