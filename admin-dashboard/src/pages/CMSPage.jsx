import React, { useState } from 'react';
import {
  FileText, Shield, HelpCircle, Info, BookOpen, Newspaper, Plus, Save
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export const CMSPage = () => {
  const { showSnackbar } = useAlert();
  const [activeTab, setActiveTab] = useState('privacy'); // privacy, terms, faq, help, about, blogs, news

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-500" /> CMS & Legal Content Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage Privacy Policy, Terms of Service, FAQs, Help Guides, About Us, Blogs & Announcement News.
          </p>
        </div>
        <button
          onClick={() => showSnackbar('CMS Content Saved Successfully!', 'success')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow hover:bg-indigo-700"
        >
          <Save className="w-4 h-4" /> Save Content Changes
        </button>
      </div>

      {/* Sub-Tabs from spec */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 no-scrollbar">
        {[
          { id: 'privacy', label: 'Privacy Policy', icon: Shield },
          { id: 'terms', label: 'Terms & Conditions', icon: FileText },
          { id: 'faq', label: 'FAQ', icon: HelpCircle },
          { id: 'help', label: 'Help Center', icon: HelpCircle },
          { id: 'about', label: 'About Us', icon: Info },
          { id: 'blogs', label: 'Blogs', icon: BookOpen },
          { id: 'news', label: 'News & Media', icon: Newspaper }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CMS Editor Container */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">Editing {activeTab} Content</h3>
        <textarea
          rows={12}
          defaultValue={`# ${activeTab.toUpperCase()} CONTENT DOCUMENTATION\n\nWelcome to our official platform policy. Last updated: July 27, 2026.\n\n1. Overview\nAll users participating in contests are required to comply with our community standards...`}
          className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
};

export default CMSPage;
