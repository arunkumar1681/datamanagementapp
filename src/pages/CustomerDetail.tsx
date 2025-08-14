import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';

interface Customer {
  serialNumber: number;
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
  createdAt: string;
}

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/customers/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setCustomer(result.data);
      } else {
        setError('Customer not found');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/customers/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Customer deleted successfully');
        navigate('/customers');
      } else {
        alert('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer');
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    if (status.toLowerCase() === 'active') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading customer details...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error || 'Customer not found'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/customers"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Customers</span>
          </Link>
          <div className="border-l border-gray-300 h-6"></div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{customer.storeName}</h2>
                <p className="text-gray-600">Serial No: {customer.serialNumber}</p>
              </div>
              <span className={getStatusBadge(customer.status)}>
                {customer.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{customer.customerEmail}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900">{customer.customerPhone}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Account ID</p>
                  <p className="text-gray-900 font-mono">{customer.accountId}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Outlet ID</p>
                  <p className="text-gray-900 font-mono">{customer.outletId}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">GSTIN</p>
                  <p className="text-gray-900 font-mono">{customer.gstin}</p>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <div className="text-gray-900">
                      <p>{customer.addressLine}</p>
                      <p>{customer.city}, {customer.state}</p>
                      <p>{customer.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-gray-900 font-medium">{customer.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Plan</p>
                <p className="text-gray-900 font-medium">{customer.currentPlan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Signup Date</p>
                <p className="text-gray-900">{customer.signupDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Renewal</p>
                <p className="text-gray-900">{customer.nextRenewalOn}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Support */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales & Support</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Sales Person</p>
              <p className="text-gray-900 font-medium">{customer.salesPerson}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Support Person</p>
              <p className="text-gray-900 font-medium">{customer.supportPerson}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Channel Partner</p>
              <p className="text-gray-900">{customer.channelPartner}</p>
            </div>
          </div>
        </div>

        {/* Plan & Billing */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan & Billing</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Signup Pack</p>
              <p className="text-gray-900">{customer.signupPack}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Product Name</p>
              <p className="text-gray-900">{customer.productName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Validity Till</p>
              <p className="text-gray-900">{customer.validityTill}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Pack Amount</p>
                <p className="text-gray-900 font-medium">₹{customer.paidPackAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">SMS Amount</p>
                <p className="text-gray-900 font-medium">₹{customer.paidSmsAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">WA Amount</p>
                <p className="text-gray-900 font-medium">₹{customer.paidWaAmount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-50 rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Created At</p>
            <p className="text-gray-900 font-mono">{customer.createdAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
};