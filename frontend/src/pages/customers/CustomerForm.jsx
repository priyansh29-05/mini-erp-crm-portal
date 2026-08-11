import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';

const CustomerForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'Retail',
    address: '',
    status: 'Lead',
    followUpDate: '',
    notes: '',
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchCustomer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch customer data');
      const data = await response.json();
      
      // Format the date for the date input
      const formattedDate = data.followUpDate 
        ? new Date(data.followUpDate).toISOString().split('T')[0] 
        : '';

      setFormData({
        name: data.name || '',
        mobile: data.mobile || '',
        email: data.email || '',
        businessName: data.businessName || '',
        gstNumber: data.gstNumber || '',
        customerType: data.customerType || 'Retail',
        address: data.address || '',
        status: data.status || 'Lead',
        followUpDate: formattedDate,
        notes: data.notes || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['name', 'mobile', 'email', 'businessName', 'customerType', 'address', 'status', 'followUpDate', 'notes'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'This field is required';
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Create a payload. Convert followUpDate to a proper ISO string or leave as YYYY-MM-DD
      const payload = {
        ...formData,
        followUpDate: new Date(formData.followUpDate).toISOString()
      };

      const url = isEditMode 
        ? `${import.meta.env.VITE_API_BASE_URL}/customers/${id}`
        : `${import.meta.env.VITE_API_BASE_URL}/customers`;
        
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        // Backend validation errors are typically returned in result.error
        throw new Error(result.error || 'Failed to save customer');
      }

      // Redirect to the newly created/edited customer detail page
      const customerId = isEditMode ? id : result.id;
      navigate(`/customers/${customerId}`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/customers" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Customer' : 'Add New Customer'}
          </h1>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-medium">Error saving customer</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`block w-full rounded-md border ${fieldErrors.name ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className={`block w-full rounded-md border ${fieldErrors.businessName ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {fieldErrors.businessName && <p className="mt-1 text-xs text-red-500">{fieldErrors.businessName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full rounded-md border ${fieldErrors.email ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className={`block w-full rounded-md border ${fieldErrors.mobile ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {fieldErrors.mobile && <p className="mt-1 text-xs text-red-500">{fieldErrors.mobile}</p>}
            </div>

            {/* Customer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Type <span className="text-red-500">*</span>
              </label>
              <select
                name="customerType"
                value={formData.customerType}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm bg-white"
              >
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm bg-white"
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Follow Up Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleChange}
                className={`block w-full rounded-md border ${fieldErrors.followUpDate ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm bg-white`}
              />
              {fieldErrors.followUpDate && <p className="mt-1 text-xs text-red-500">{fieldErrors.followUpDate}</p>}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleChange}
                className={`block w-full rounded-md border ${fieldErrors.address ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {fieldErrors.address && <p className="mt-1 text-xs text-red-500">{fieldErrors.address}</p>}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                name="notes"
                rows="4"
                value={formData.notes}
                onChange={handleChange}
                className={`block w-full rounded-md border ${fieldErrors.notes ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
                placeholder="Initial details or requirements..."
              />
              {fieldErrors.notes && <p className="mt-1 text-xs text-red-500">{fieldErrors.notes}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {isEditMode ? 'Update Customer' : 'Save Customer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
