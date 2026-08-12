import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    unitPrice: '',
    currentStock: '',
    minStockAlert: '',
    location: '',
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch product data');
      const data = await response.json();
      
      setFormData({
        name: data.name || '',
        sku: data.sku || '',
        category: data.category || 'Electronics',
        unitPrice: data.unitPrice !== undefined ? data.unitPrice : '',
        currentStock: data.currentStock !== undefined ? data.currentStock : '',
        minStockAlert: data.minStockAlert !== undefined ? data.minStockAlert : '',
        location: data.location || '',
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
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['name', 'sku', 'category', 'unitPrice', 'currentStock', 'minStockAlert', 'location'];
    
    requiredFields.forEach(field => {
      if (formData[field] === '' || formData[field] === null) {
        errors[field] = 'This field is required';
      }
    });

    if (formData.unitPrice !== '' && Number(formData.unitPrice) < 0) {
      errors.unitPrice = 'Price cannot be negative';
    }
    if (formData.currentStock !== '' && Number(formData.currentStock) < 0) {
      errors.currentStock = 'Stock cannot be negative';
    }
    if (formData.minStockAlert !== '' && Number(formData.minStockAlert) < 0) {
      errors.minStockAlert = 'Minimum stock cannot be negative';
    }

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
      // In edit mode, backend ignores currentStock, but we send the parsed numbers for others
      const payload = {
        ...formData,
        unitPrice: Number(formData.unitPrice),
        currentStock: Number(formData.currentStock),
        minStockAlert: Number(formData.minStockAlert)
      };

      const url = isEditMode 
        ? `${import.meta.env.VITE_API_BASE_URL}/products/${id}`
        : `${import.meta.env.VITE_API_BASE_URL}/products`;
        
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
        throw new Error(result.error || 'Failed to save product');
      }

      const productId = isEditMode ? id : result.id;
      navigate(`/products/${productId}`);
      
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
          <Link to="/products" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-start">
            <AlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium">Error saving product</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
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

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`block w-full font-mono rounded-md border ${fieldErrors.sku ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {fieldErrors.sku && <p className="mt-1 text-xs text-red-500">{fieldErrors.sku}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm bg-white"
              >
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                className={`block w-full rounded-md border ${fieldErrors.unitPrice ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {fieldErrors.unitPrice && <p className="mt-1 text-xs text-red-500">{fieldErrors.unitPrice}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Warehouse A, Aisle 4"
                className={`block w-full rounded-md border ${fieldErrors.location ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {fieldErrors.location && <p className="mt-1 text-xs text-red-500">{fieldErrors.location}</p>}
            </div>

            {/* Current Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                disabled={isEditMode}
                className={`block w-full rounded-md border ${fieldErrors.currentStock ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${isEditMode ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
              />
              {fieldErrors.currentStock && <p className="mt-1 text-xs text-red-500">{fieldErrors.currentStock}</p>}
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500 italic">
                  Stock can only be changed via a Stock Movement (see product detail page).
                </p>
              )}
            </div>

            {/* Min Stock Alert */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stock Alert Threshold <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                name="minStockAlert"
                value={formData.minStockAlert}
                onChange={handleChange}
                className={`block w-full rounded-md border ${fieldErrors.minStockAlert ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {fieldErrors.minStockAlert && <p className="mt-1 text-xs text-red-500">{fieldErrors.minStockAlert}</p>}
            </div>

          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/products')}
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
                  {isEditMode ? 'Update Product' : 'Save Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
