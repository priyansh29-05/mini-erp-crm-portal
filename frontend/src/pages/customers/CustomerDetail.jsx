import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Edit, Building2, Phone, Mail, MapPin, Calendar, Clock, Send } from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Note form state
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [noteError, setNoteError] = useState(null);

  useEffect(() => {
    fetchCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch customer data');
      const data = await response.json();
      setCustomer(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    setNoteError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note: newNote })
      });

      if (!response.ok) throw new Error('Failed to add note');
      
      const updatedCustomer = await response.json();
      // Optimistically or explicitly update the customer notes from response
      setCustomer(prev => ({
        ...prev,
        notes: updatedCustomer.notes
      }));
      setNewNote(''); // Clear input

    } catch (err) {
      setNoteError(err.message);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg max-w-4xl mx-auto">
        {error || 'Customer not found'}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/customers" className="text-gray-500 hover:text-gray-700 mr-4">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
            <p className="text-gray-500 text-sm mt-1">ID: {customer.id}</p>
          </div>
        </div>
        <Link
          to={`/customers/${id}/edit`}
          className="inline-flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Edit size={18} className="mr-2" />
          Edit Customer
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Customer Profile</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex items-start space-x-3">
                <Building2 size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Business Name</p>
                  <p className="text-gray-900">{customer.businessName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Mobile</p>
                  <p className="text-gray-900">{customer.mobile}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-gray-900">{customer.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Address</p>
                  <p className="text-gray-900">{customer.address}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Customer Type</p>
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {customer.customerType}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Status</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                  customer.status === 'Lead' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {customer.status}
                </span>
              </div>

              {customer.gstNumber && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 font-medium">GST Number</p>
                  <p className="text-gray-900 font-mono">{customer.gstNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Follow-up & Notes */}
        <div className="space-y-6">
          {/* Follow-up Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <Calendar size={18} className="text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Follow-up</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 font-medium mb-1">Scheduled Date</p>
              <p className="text-gray-900 font-medium">
                {new Date(customer.followUpDate).toLocaleDateString(undefined, {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <Clock size={18} className="text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Notes & History</h2>
            </div>
            
            {/* Display existing notes */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 whitespace-pre-wrap text-sm text-gray-700">
              {customer.notes || 'No notes available.'}
            </div>

            {/* Add Note Form */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {noteError && <p className="text-red-500 text-xs mb-2">{noteError}</p>}
              <form onSubmit={handleAddNote} className="flex flex-col gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a follow-up note..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={addingNote || !newNote.trim()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {addingNote ? 'Saving...' : (
                      <>
                        <Send size={16} className="mr-2" />
                        Add Note
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerDetail;
