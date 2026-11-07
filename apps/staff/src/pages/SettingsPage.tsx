import React, { useEffect, useState } from 'react';
import { SystemSettingsDto } from '@libreriard/shared';
import { SettingsService } from '../services/settings.service';
import { BankSettingsTab } from '../components/settings/BankSettingsTab';
import { ContactSettingsTab } from '../components/settings/ContactSettingsTab';
import { LegalSettingsTab } from '../components/settings/LegalSettingsTab';
import { Building2, MapPin, FileText } from 'lucide-react';

type TabType = 'bank' | 'contact' | 'legal';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('bank');
  const [settings, setSettings] = useState<SystemSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const settingsService = new SettingsService();

  const loadSettings = () => {
    settingsService.getSettings().then((res) => {
      if (res.success && res.data) setSettings(res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading || !settings) {
    return <div className="p-8 text-center text-slate-500">Cargando configuración...</div>;
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'bank', label: 'Datos Bancarios', icon: <Building2 size={16} /> },
    { id: 'contact', label: 'Contacto y Ubicación Footer', icon: <MapPin size={16} /> },
    { id: 'legal', label: 'Términos y Privacidad', icon: <FileText size={16} /> }
  ];

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex border-b border-slate-800 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
        {activeTab === 'bank' && (
          <BankSettingsTab initialData={settings.bankTransferDetails} onSaved={loadSettings} />
        )}
        {activeTab === 'contact' && (
          <ContactSettingsTab initialData={settings.footerContact} onSaved={loadSettings} />
        )}
        {activeTab === 'legal' && (
          <LegalSettingsTab
            initialTerms={settings.termsAndConditions}
            initialPrivacy={settings.privacyPolicy}
            onSaved={loadSettings}
          />
        )}
      </div>
    </div>
  );
};
