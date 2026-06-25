import React, { useState, useEffect } from 'react';
import { Globe, Moon, Sun, Monitor } from 'lucide-react';

const SettingsManager = () => {
    // Initialize state from localStorage to persist settings
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Effect to apply Theme immediately
    useEffect(() => {
        const root = window.document.documentElement;
        // Basic class-based dark mode toggle
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Effect to apply Language immediately (persistance + update DOM lang)
    useEffect(() => {
        document.documentElement.lang = language;
        localStorage.setItem('language', language);
        // Note: Full app translation would require an i18n context provider to be wrapped around the app
        // For now, this persists the user's choice.
    }, [language]);

    return (
        <div className="space-y-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

            {/* Language Settings */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Language</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer" onClick={() => setLanguage('en')}>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${language === 'en' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                            {language === 'en' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <label className="text-sm font-medium text-gray-700 cursor-pointer">English</label>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer" onClick={() => setLanguage('my')}>
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${language === 'my' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                            {language === 'my' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <label className="text-sm font-medium text-gray-700 cursor-pointer">Malay (Bahasa Melayu)</label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsManager;