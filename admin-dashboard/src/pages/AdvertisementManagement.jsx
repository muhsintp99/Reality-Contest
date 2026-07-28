import React, { useState } from 'react';
import {
  Megaphone, Plus, Trophy, Image, Video, Gift, Users, Play, Search, Filter, Edit, Trash2, Eye, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const AdvertisementManagement = () => {
  const { showSnackbar } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [viewingAd, setViewingAd] = useState(null);
  const [deletingAd, setDeletingAd] = useState(null);

  const [campaigns, setCampaigns] = useState([
    { id: 'AD-101', client: 'RedBull Energy', type: 'Sponsored Contest', budget: '₹2,50,000', impressions: '540.2K', status: 'Active' },
    { id: 'AD-102', client: 'Nike India', type: 'Reward Ads (Watch-to-Earn)', budget: '₹1,00,000', impressions: '210.8K', status: 'Active' },
    { id: 'AD-103', client: 'Boat Headphones', type: 'Banner Ads', budget: '₹50,000', impressions: '98.0K', status: 'Inactive' }
  ]);

  const [formData, setFormData] = useState({
    client: '',
    type: 'Sponsored Contest',
    budget: '₹1,00,000',
    status: 'Active'
  });

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.client.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (id) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
        showSnackbar(`Campaign ${c.id} status changed to ${nextStatus}`, 'info');
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleSaveAdd = () => {
    if (!formData.client) {
      showSnackbar('Please enter advertiser/client name', 'warning');
      return;
    }
    const newAd = {
      id: `AD-${Date.now().toString().slice(-4)}`,
      impressions: '0K',
      ...formData
    };
    setCampaigns([newAd, ...campaigns]);
    showSnackbar('Ad Campaign Created!', 'success');
    setShowAddModal(false);
    setFormData({ client: '', type: 'Sponsored Contest', budget: '₹1,00,000', status: 'Active' });
  };

  const handleSaveEdit = () => {
    setCampaigns(prev => prev.map(c => c.id === editingAd.id ? editingAd : c));
    showSnackbar(`Ad Campaign ${editingAd.id} updated!`, 'success');
    setEditingAd(null);
  };

  const handleDelete = (id) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    showSnackbar(`Ad Campaign ${id} deleted!`, 'success');
    setDeletingAd(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-rose-500" /> Advertisement Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Add, Edit, View, Delete, Toggle Active Status & Filter Ad Campaigns.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-semibold text-xs rounded-xl shadow hover:bg-rose-700"
        >
          <Plus className="w-4 h-4" /> Add New Ad
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0B1120] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search client or ad ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-white">
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-medium border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-3.5">Campaign ID / Client</th>
                <th className="px-5 py-3.5">Ad Format</th>
                <th className="px-5 py-3.5">Budget</th>
                <th className="px-5 py-3.5">Impressions</th>
                <th className="px-5 py-3.5">Active Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {filteredCampaigns.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{c.client}</div>
                    <div className="text-[11px] text-slate-400">{c.id}</div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-rose-500">{c.type}</td>
                  <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">{c.budget}</td>
                  <td className="px-5 py-4 font-bold text-emerald-500">{c.impressions}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleStatus(c.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {c.status === 'Active' ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                      {c.status}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewingAd(c)} title="View Details" className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingAd(c)} title="Edit Campaign" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingAd(c)} title="Delete Campaign" className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Ad Campaign</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Advertiser / Client</label>
                <input type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Ad Format</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white">
                    <option value="Sponsored Contest">Sponsored Contest</option>
                    <option value="Reward Ads (Watch-to-Earn)">Reward Ads</option>
                    <option value="Banner Ads">Banner Ads</option>
                    <option value="Video Ads">Video Ads</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Budget</label>
                  <input type="text" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveAdd} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Save Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit {editingAd.id}</h3>
              <button onClick={() => setEditingAd(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Client</label>
                <input type="text" value={editingAd.client} onChange={e => setEditingAd({...editingAd, client: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingAd(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ad Campaign {viewingAd.id}</h3>
              <button onClick={() => setViewingAd(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p><strong>Client:</strong> {viewingAd.client}</p>
            <p><strong>Format:</strong> {viewingAd.type}</p>
            <p><strong>Budget:</strong> {viewingAd.budget}</p>
            <p><strong>Impressions:</strong> {viewingAd.impressions}</p>
            <p><strong>Status:</strong> {viewingAd.status}</p>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingAd(null)} className="px-4 py-2 font-semibold bg-rose-600 text-white rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-500">Delete Ad Campaign</h3>
            <p className="text-xs text-slate-400">Are you sure you want to delete <strong>{deletingAd.id}</strong> ({deletingAd.client})?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeletingAd(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button onClick={() => handleDelete(deletingAd.id)} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementManagement;
