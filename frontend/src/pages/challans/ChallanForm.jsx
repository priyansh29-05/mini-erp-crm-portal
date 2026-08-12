import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { ArrowLeft, Save, AlertCircle, Plus, Trash2, Search, User } from 'lucide-react';

const ChallanForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Submission state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Customer Selection State
  const [customerSearch, setCustomerSearch] = useState('');
  const debouncedCustomerSearch = useDebounce(customerSearch, 400);
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchingCustomers, setSearchingCustomers] = useState(false);

  // Line Items State
  const [items, setItems] = useState([]);
  
  // Product Search State (for adding new items)
  const [productSearch, setProductSearch] = useState('');
  const debouncedProductSearch = useDebounce(productSearch, 400);
  const [productResults, setProductResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Fetch Customers when typing
  useEffect(() => {
    if (debouncedCustomerSearch.trim().length > 1) {
      searchCustomers();
    } else {
      setCustomerResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCustomerSearch]);

  // Fetch Products when typing
  useEffect(() => {
    if (debouncedProductSearch.trim().length > 1) {
      searchProducts();
    } else {
      setProductResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedProductSearch]);

  const searchCustomers = async () => {
    setSearchingCustomers(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers?search=${debouncedCustomerSearch}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setCustomerResults(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingCustomers(false);
    }
  };

  const searchProducts = async () => {
    setSearchingProducts(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products?search=${debouncedProductSearch}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setProductResults(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingProducts(false);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setCustomerResults([]);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
  };

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setProductSearch('');
    setProductResults([]);
    setSelectedQuantity(1);
  };

  const addLineItem = () => {
    if (!selectedProduct || selectedQuantity < 1) return;

    // Check if already in list, if so just update quantity
    const existingIndex = items.findIndex(i => i.productId === selectedProduct.id);
    
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += Number(selectedQuantity);
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name, // for display only
          unitPrice: selectedProduct.unitPrice, // for display only
          quantity: Number(selectedQuantity)
        }
      ]);
    }
    
    setSelectedProduct(null);
    setSelectedQuantity(1);
  };

  const removeLineItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedCustomer) {
      setError("Please select a customer.");
      return;
    }
    
    if (items.length === 0) {
      setError("Please add at least one product to the challan.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerId: selectedCustomer.id,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/challans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create challan');
      }

      navigate(`/challans/${result.id}`);
      
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const displayTotalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/challans" className="text-gray-500 hover:text-gray-700 mr-4">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Create Sales Challan</h1>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-start shadow-sm">
              <AlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium">Error creating challan</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            
            {/* Step 1: Customer Selection */}
            <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">1</span>
                Select Customer
              </h2>
              
              {selectedCustomer ? (
                <div className="flex items-center justify-between bg-white p-4 rounded-md border border-gray-300 shadow-sm">
                  <div className="flex items-center">
                    <User className="text-gray-400 mr-3" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer.businessName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={clearCustomer}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search customers by name, business, or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                    />
                    {searchingCustomers && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  
                  {customerResults.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {customerResults.map((cust) => (
                        <li 
                          key={cust.id}
                          onClick={() => selectCustomer(cust)}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                        >
                          <div className="font-medium text-gray-900">{cust.name}</div>
                          <div className="text-gray-500 text-xs">{cust.businessName} • {cust.mobile}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>

            {/* Step 2: Line Items Builder */}
            <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">2</span>
                Build Line Items
              </h2>

              {/* Product Selector Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-6 bg-white p-4 rounded-md border border-gray-300 shadow-sm">
                <div className="flex-1 w-full relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Product</label>
                  {!selectedProduct ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Type to search..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      {searchingProducts && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      
                      {productResults.length > 0 && (
                        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {productResults.map((prod) => (
                            <li 
                              key={prod.id}
                              onClick={() => selectProduct(prod)}
                              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                            >
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-900">{prod.name}</span>
                                <span className="text-gray-500">${Number(prod.unitPrice).toFixed(2)}</span>
                              </div>
                              <div className="text-gray-500 text-xs">SKU: {prod.sku} • Stock: {prod.currentStock}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 py-2 px-3 rounded-md">
                      <div>
                        <span className="font-medium text-blue-900 text-sm">{selectedProduct.name}</span>
                        <span className="ml-2 text-xs text-blue-700">(${Number(selectedProduct.unitPrice).toFixed(2)})</span>
                      </div>
                      <button 
                        onClick={() => setSelectedProduct(null)}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="w-full sm:w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    disabled={!selectedProduct}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={addLineItem}
                  disabled={!selectedProduct || selectedQuantity < 1}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-900 disabled:bg-gray-300 transition-colors"
                >
                  <Plus size={16} className="mr-1" /> Add
                </button>
              </div>

              {/* Selected Items Table */}
              {items.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeLineItem(idx)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-medium">
                      <tr>
                        <td colSpan="2" className="px-4 py-3 text-right text-gray-700">Totals:</td>
                        <td className="px-4 py-3 text-right text-gray-900">{totalQuantity} items</td>
                        <td className="px-4 py-3 text-right text-gray-900">${displayTotalValue.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-white border border-gray-200 rounded-md border-dashed">
                  <p className="text-gray-500 text-sm">No products added yet. Search and add products above.</p>
                </div>
              )}
            </section>

          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/challans')}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !selectedCustomer || items.length === 0}
              className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Draft Challan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallanForm;
