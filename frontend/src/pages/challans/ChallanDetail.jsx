import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, FileText, User, Calendar, Info } from 'lucide-react';

const ChallanDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchChallan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchChallan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/challans/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch challan data');
      const data = await response.json();
      setChallan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setProcessing(true);
    setActionError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/challans/${id}/confirm`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm challan');
      }
      setChallan(data); // Update with confirmed status
    } catch (err) {
      setActionError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this challan? This action cannot be undone.')) {
      return;
    }
    
    setProcessing(true);
    setActionError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/challans/${id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel challan');
      }
      setChallan(data); // Update with cancelled status
    } catch (err) {
      setActionError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !challan) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg max-w-4xl mx-auto">
        {error || 'Challan not found'}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/challans" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-800">Challan {challan.challanNumber}</h1>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                challan.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                challan.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {challan.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">ID: {challan.id}</p>
          </div>
        </div>
        
        {/* Action Buttons for DRAFT */}
        {challan.status === 'DRAFT' && (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              disabled={processing}
              className="inline-flex items-center justify-center bg-white border border-red-300 text-red-700 hover:bg-red-50 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <XCircle size={18} className="mr-2" />
              Cancel Challan
            </button>
            <button
              onClick={handleConfirm}
              disabled={processing}
              className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-green-400"
            >
              <CheckCircle size={18} className="mr-2" />
              Confirm Challan
            </button>
          </div>
        )}
      </div>

      {actionError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start shadow-sm">
          <AlertTriangle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-red-800 font-medium">Action Failed</h3>
            <p className="text-red-700 text-sm mt-1">{actionError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Meta Data */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <FileText size={18} className="text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Details</h2>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex items-start space-x-3">
                <User size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Customer</p>
                  <p className="text-gray-900 font-medium">{challan.customer?.name}</p>
                  <Link to={`/customers/${challan.customerId}`} className="text-xs text-blue-600 hover:underline">
                    View Customer Profile
                  </Link>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Created At</p>
                  <p className="text-gray-900">
                    {new Date(challan.createdAt).toLocaleString(undefined, { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">By: {challan.createdBy}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500 font-medium">Total Quantity</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{challan.totalQuantity}</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Right Column: Line Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Line Items</h2>
            </div>
            
            <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center text-xs text-blue-700">
              <Info size={14} className="mr-2 flex-shrink-0" />
              <span>Prices and names reflect the snapshot captured at the time this challan was created.</span>
            </div>

            <div className="flex-1 overflow-x-auto relative">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (Snapshot)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {challan.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.productNameSnapshot}</div>
                        <div className="text-xs text-gray-500">ID: {item.productId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        ${Number(item.unitPriceSnapshot).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        ${(item.quantity * item.unitPriceSnapshot).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                      Total:
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {challan.totalQuantity} items
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      ${challan.items?.reduce((sum, item) => sum + (item.quantity * item.unitPriceSnapshot), 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChallanDetail;
