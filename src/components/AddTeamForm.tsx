/**
 * Add Team Form Component
 * Simple form to add teams from API with automatic match fetching
 */

import { useState } from 'react';
import { Card } from './Layout';
import { X, Loader, Search } from 'lucide-react';
import { quickImportTeam } from '@/lib/services/quickTeamImport';
import { testTeamId } from '@/lib/api/teamHelper';

interface AddTeamFormProps {
  onAddTeam?: () => void;
  onClose: () => void;
}

export function AddTeamForm({ onAddTeam, onClose }: AddTeamFormProps) {
  const [formData, setFormData] = useState({
    apiId: '',
    name: '',
    code: '',
    logo: '',
    founded: new Date().getFullYear(),
    country: 'Türkiye',
    marketValue: 0,
    matchCount: 10,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string; teamName?: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'founded' || name === 'marketValue' || name === 'matchCount' || name === 'apiId' ? Number(value) : value,
    }));
    setError(null);
    setTestResult(null);
  };

  const handleTestTeamId = async () => {
    if (!formData.apiId) {
      setTestResult({
        valid: false,
        message: 'Lütfen önce Takım ID girin',
      });
      return;
    }

    setIsTesting(true);
    const result = await testTeamId(parseInt(formData.apiId));
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.apiId || !formData.name.trim() || !formData.code.trim()) {
      setError('Lütfen Takım ID, Adı ve Kodunu girin');
      return;
    }

    if (formData.matchCount < 5 || formData.matchCount > 50) {
      setError('Maç sayısı 5-50 arasında olmalıdır');
      return;
    }

    setIsLoading(true);

    try {
      await quickImportTeam(
        {
          apiId: parseInt(formData.apiId),
          name: formData.name,
          code: formData.code,
          logo: formData.logo,
          founded: formData.founded,
          country: formData.country,
          marketValue: formData.marketValue,
        },
        formData.matchCount
      );

      setSuccess(true);
      if (onAddTeam) {
        onAddTeam();
      }

      setFormData({
        apiId: '',
        name: '',
        code: '',
        logo: '',
        founded: new Date().getFullYear(),
        country: 'Türkiye',
        marketValue: 0,
        matchCount: 10,
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Takım eklenirken hata oluştu';
      console.error('Team import error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Takım Ekle</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {success && (
          <div className="mb-4 bg-green-900 bg-opacity-30 border border-green-700 rounded p-3 text-green-300 text-sm">
            ✓ Takım başarıyla eklendi! Sayfayı yenileyecek...
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-900 bg-opacity-30 border border-red-700 rounded p-3 text-red-300 text-sm max-h-32 overflow-y-auto">
            <div className="font-semibold mb-1">✗ Hata Oluştu:</div>
            <div className="whitespace-pre-wrap">{error}</div>
            <div className="text-xs text-gray-300 mt-2">
              💡 İpucu: Browser'ın DevTools'unu açarak (F12) Console sekmesinde hataya bakabilirsiniz.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              API-Football Takım ID *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="apiId"
                value={formData.apiId}
                onChange={handleInputChange}
                disabled={isLoading || isTesting}
                className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                placeholder="Örneğin: 100"
              />
              <button
                type="button"
                onClick={handleTestTeamId}
                disabled={isLoading || isTesting || !formData.apiId}
                className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition flex items-center gap-1"
                title="Takım ID'sini test et"
              >
                {isTesting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Test
              </button>
            </div>

            {testResult && (
              <div className={`mt-2 p-2 rounded text-xs ${
                testResult.valid 
                  ? 'bg-green-900 bg-opacity-30 border border-green-700 text-green-300' 
                  : 'bg-yellow-900 bg-opacity-30 border border-yellow-700 text-yellow-300'
              }`}>
                {testResult.message}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-2 mb-1 font-semibold">Bazı Türk Takımları:</p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Galatasaray: 100</p>
              <p>• Fenerbahçe: 53</p>
              <p>• Beşiktaş: 81</p>
              <p>• Trabzonspor: 179</p>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              ℹ️ Diğer takımları bulmak için: https://www.api-football.com
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Takım Adı *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              placeholder="Galatasaray"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Takım Kodu *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              disabled={isLoading}
              maxLength={3}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              placeholder="GS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              name="logo"
              value={formData.logo}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Kuruluş Yılı
              </label>
              <input
                type="number"
                name="founded"
                value={formData.founded}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ülke
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Piyasa Değeri (Milyon €)
            </label>
            <input
              type="number"
              name="marketValue"
              value={formData.marketValue}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Kaç Maçı Yükle? *
            </label>
            <select
              name="matchCount"
              value={formData.matchCount}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
            >
              <option value={5}>Son 5 Maç</option>
              <option value={10}>Son 10 Maç</option>
              <option value={15}>Son 15 Maç</option>
              <option value={20}>Son 20 Maç</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || isTesting || success}
              className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold py-2 rounded transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                'Takımı Ekle'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isTesting}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-2 rounded transition"
            >
              İptal
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
