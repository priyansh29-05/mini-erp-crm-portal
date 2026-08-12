import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Edit, AlertTriangle, Box, DollarSign, MapPin, Layers, History, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stock Movement Form State
  const [movementType, setMovementType] = useState('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [movingStock, setMovingStock] = useState(false);
  const [moveError, setMoveError] = useState(null);

  // Stock History State
  const [history, setHistory] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 5;
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page, product?.currentStock]); // re-fetch history if stock changes or page changes

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch product data');
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}/stock-movements?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch stock history');
      const data = await response.json();
      setHistory(data.data);
      setHistoryTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStockMovement = async (e) => {
    e.preventDefault();
    if (!quantity || Number(quantity) <= 0 || !reason.trim()) {
      setMoveError("Please provide a valid quantity and reason.");
      return;
    }

    setMovingStock(true);
    setMoveError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}/stock-movement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movementType,
          quantity: Number(quantity),
          reason
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to record stock movement');
      }

      // Success: update product current stock, clear form, reset history page to 1
      setProduct(prev => ({
        ...prev,
        currentStock: result.currentStock,
        isLowStock: result.currentStock <= prev.minStockAlert
      }));
      setQuantity('');
      setReason('');
      setPage(1);

    } catch (err) {
      setMoveError(err.message);
    } finally {
      setMovingStock(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg max-w-4xl mx-auto">
        {error || 'Product not found'}
      </div>
    );
  }

  const isLow = product.currentStock <= product.minStockAlert;
  const historyPages = Math.ceil(historyTotal / limit);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Low Stock Banner */}
      {isLow && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start shadow-sm">
          <AlertTriangle className="text-red-500 mr-3 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-medium">Low Stock Warning</h3>
            <p className="text-red-700 text-sm mt-1">
              Current stock ({product.currentStock}) is at or below the minimum threshold ({product.minStockAlert}). Please restock soon.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/products" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-gray-500 text-sm mt-1 font-mono">SKU: {product.sku}</p>
          </div>
        </div>
        <Link
          to={`/products/${id}/edit`}
          className="inline-flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Edit size={18} className="mr-2" />
          Edit Product
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <Box size={18} className="text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Product Info</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">Category</p>
                <span className="mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {product.category}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <DollarSign size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Unit Price</p>
                  <p className="text-gray-900 font-medium">${Number(product.unitPrice).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Location</p>
                  <p className="text-gray-900">{product.location}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 font-medium mb-2">Inventory Status</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg border ${isLow ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-xs text-gray-500 font-medium">Current Stock</p>
                    <p className={`text-xl font-bold ${isLow ? 'text-red-700' : 'text-gray-900'}`}>
                      {product.currentStock}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">Min Alert</p>
                    <p className="text-xl font-bold text-gray-900">{product.minStockAlert}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inventory Management */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Record Movement Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <Activity size={18} className="text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Record Stock Movement</h2>
            </div>
            <div className="p-6">
              {moveError && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded flex items-start">
                  <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
                  <span>{moveError}</span>
                </div>
              )}
              
              <form onSubmit={handleStockMovement} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="IN">IN (Add Stock)</option>
                    <option value="OUT">OUT (Remove Stock)</option>
                  </select>
                </div>
                
                <div className="w-full sm:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 50"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="w-full sm:flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. New shipment received"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={movingStock}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {movingStock ? 'Saving...' : 'Record'}
                </button>
              </form>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center">
                <History size={18} className="text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Stock Movement History</h2>
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto relative min-h-[200px]">
              {loadingHistory ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No stock movements recorded yet.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {history.map((mov) => (
                      <tr key={mov.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(mov.createdAt).toLocaleString(undefined, { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
                          })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                            mov.movementType === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {mov.movementType}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                          {mov.movementType === 'IN' ? '+' : '-'}{mov.quantityChanged}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={mov.reason}>
                          {mov.reason}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                          {mov.createdBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination for History */}
            {historyTotal > limit && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing {(page - 1) * limit + 1}-{Math.min(page * limit, historyTotal)} of {historyTotal}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loadingHistory}
                    className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(historyPages, p + 1))}
                    disabled={page >= historyPages || loadingHistory}
                    className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
