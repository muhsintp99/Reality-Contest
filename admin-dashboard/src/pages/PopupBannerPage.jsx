import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const PopupBannerPage = () => {
  const { showSnackbar } = useAlert();
  const [banners, setBanners] = useState([
    { id: 'BNR-02', title: 'Diwali Special Contest Popup', type: 'Popup Banner', targetUrl: '/contests/festival-pass', impressions: '89.1K', status: 'Active' }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', targetUrl: '', status: 'Active' });

  const handleToggle = (id) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'Active' ? 'Inactive' : 'Active' } : b));
    showSnackbar('Popup banner status updated!', 'info');
  };

  const handleAdd = () => {
    if (!formData.title) return showSnackbar('Title is required', 'warning');
    const newB = { id: `BNR-${Date.now().toString().slice(-3)}`, type: 'Popup Banner', impressions: '0K', ...formData };
    setBanners([newB, ...banners]);
    setShowAddModal(false);
    showSnackbar('Popup Banner added!', 'success');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-amber-500" /> Popup Banner Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Configure app launch popups & modal promotional announcements.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Popup Banner
        </button>
      </div>

      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">Banner Info</th>
              <th className="px-5 py-3.5">Target Redirect URL</th>
              <th className="px-5 py-3.5">Impressions</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {banners.map(b => (
              <tr key={b.id}>
                <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{b.title}<div className="text-[11px] text-slate-400">{b.id}</div></td>
                <td className="px-5 py-4 font-mono text-amber-500">{b.targetUrl}</td>
                <td className="px-5 py-4 font-bold text-emerald-500">{b.impressions}</td>
                <td className="px-5 py-4">
                  <button onClick={() => handleToggle(b.id)} className="flex items-center gap-1 font-bold">
                    {b.status === 'Active' ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => setBanners(banners.filter(x => x.id !== b.id))} className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Popup Banner</h3><button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <div className="space-y-3 text-xs">
              <input type="text" placeholder="Popup Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-slate-800 dark:text-white" />
              <input type="text" placeholder="Target URL" value={formData.targetUrl} onChange={e => setFormData({ ...formData, targetUrl: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-slate-800 dark:text-white" />
            </div>
            <div className="flex justify-end gap-2 pt-2"><button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button><button onClick={handleAdd} className="px-4 py-2 text-xs bg-amber-500 text-white rounded-xl font-bold">Save Popup</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupBannerPage;
