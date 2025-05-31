'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function MyLinks() {
  const [savedLinks, setSavedLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ affiliate_code: '', custom_name: '' });
  const [copiedId, setCopiedId] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  // Fetch saved links
  useEffect(() => {
    fetchSavedLinks();
  }, [user]);

  const fetchSavedLinks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('saved_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSavedLinks(data || []);
    } catch (error) {
      console.error('Error fetching saved links:', error);
      setError('Failed to load your saved links. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (link) => {
    setEditingId(link.id);
    setEditForm({
      affiliate_code: link.affiliate_code || '',
      custom_name: link.custom_name || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ affiliate_code: '', custom_name: '' });
  };

  const handleUpdateLink = async (id) => {
    try {
      // Generate new affiliate link with updated code
      const link = savedLinks.find(l => l.id === id);
      const asin = link.affiliate_link.match(/\/dp\/([A-Z0-9]+)\//)?.[1];
      const newAffiliateLink = `https://www.amazon.com/dp/${asin}/?tag=${editForm.affiliate_code}`;

      const { error } = await supabase
        .from('saved_links')
        .update({
          affiliate_code: editForm.affiliate_code,
          affiliate_link: newAffiliateLink,
          custom_name: editForm.custom_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setSavedLinks(savedLinks.map(link => 
        link.id === id 
          ? { ...link, affiliate_code: editForm.affiliate_code, affiliate_link: newAffiliateLink, custom_name: editForm.custom_name }
          : link
      ));
      
      setEditingId(null);
      setSuccessMessage('Link updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating link:', error);
      setError('Failed to update the link. Please try again.');
    }
  };

  const handleDeleteLink = async (id) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
      const { error } = await supabase
        .from('saved_links')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setSavedLinks(savedLinks.filter(link => link.id !== id));
      setSuccessMessage('Link deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting link:', error);
      setError('Failed to delete the link. Please try again.');
    }
  };

  const handleCopyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Affiliate Links</h1>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Link
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {successMessage}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : savedLinks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p className="text-gray-500 mb-4">You haven't created any affiliate links yet.</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Create Your First Link
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedLinks.map((link) => (
                <div key={link.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  {editingId === link.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Name</label>
                        <input
                          type="text"
                          value={editForm.custom_name}
                          onChange={(e) => setEditForm({ ...editForm, custom_name: e.target.value })}
                          placeholder="e.g., Gaming Headset Review"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Code</label>
                        <input
                          type="text"
                          value={editForm.affiliate_code}
                          onChange={(e) => setEditForm({ ...editForm, affiliate_code: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateLink(link.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          {link.custom_name && (
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{link.custom_name}</h3>
                          )}
                          <p className="text-sm text-gray-500 break-all">{link.original_url}</p>
                        </div>
                        <span className="text-xs text-gray-400 ml-4">{formatDate(link.created_at)}</span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <code className="text-sm text-gray-700 break-all flex-1">{link.affiliate_link}</code>
                          <button
                            onClick={() => handleCopyLink(link.affiliate_link, link.id)}
                            className="ml-3 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Copy link"
                          >
                            {copiedId === link.id ? (
                              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {link.affiliate_code}
                        </span>
                        <div className="flex-1"></div>
                        <button
                          onClick={() => handleEdit(link)}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}