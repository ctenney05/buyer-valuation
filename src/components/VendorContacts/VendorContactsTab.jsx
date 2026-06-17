import { Mail, Phone, Users } from 'lucide-react';
import { contacts } from '../../data/vendorContacts.js';

const TEAM_COLORS = {
  Sales:                  'bg-indigo-50 text-indigo-700',
  'Customer Success':     'bg-emerald-50 text-emerald-700',
  'Pre-Sales':            'bg-blue-50 text-blue-700',
  Support:                'bg-amber-50 text-amber-700',
  'Professional Services':'bg-violet-50 text-violet-700',
};

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
];

export default function VendorContactsTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-800">Vendor Contacts</h2>
        <span className="text-xs text-slate-400 ml-1">{contacts.length} contacts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c, i) => {
          const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const teamStyle   = TEAM_COLORS[c.team] ?? 'bg-slate-100 text-slate-600';

          return (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${avatarColor}`}>
                  {c.avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">{c.role}</p>
                  <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${teamStyle}`}>
                    {c.team}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <a
                  href={`mailto:${c.email}`}
                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-600 transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 flex-shrink-0" />
                  <span className="truncate">{c.email}</span>
                </a>
                <a
                  href={`tel:${c.phone}`}
                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-600 transition-colors group"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 flex-shrink-0" />
                  <span>{c.phone}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
