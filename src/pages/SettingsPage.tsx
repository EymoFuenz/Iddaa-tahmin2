import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserProfile } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { resizeImageToMaxSize } from '@/lib/imageUtils';
import {
  Settings,
  User,
  Camera,
  Loader2,
  Info,
  Mail,
  Calendar,
  Shield,
  Bell,
  Palette,
  Globe,
} from 'lucide-react';

function formatDate(ms: string | undefined): string {
  if (!ms) return '—';
  try {
    return new Date(ms).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { profile, loading, updateProfile } = useUserProfile();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [photoBase64, setPhotoBase64] = useState<string | null>(profile?.photoBase64 ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const creationTime = user?.metadata?.creationTime;
  const lastSignInTime = user?.metadata?.lastSignInTime;

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? '');
      setPhotoBase64(profile.photoBase64 ?? null);
    }
  }, [profile]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Lütfen bir resim dosyası seçin.');
      return;
    }
    setError(null);
    try {
      const dataUrl = await resizeImageToMaxSize(file);
      setPhotoBase64(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resim işlenemedi.');
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        photoBase64: photoBase64 ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const themeLabel = theme === 'light' ? 'Açık' : theme === 'dark' ? 'Koyu' : 'Sisteme uy';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="site-container py-8">
        <div className="mb-8 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 shrink-0 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Ayarlar</h1>
              <p className="text-sm text-muted-foreground">Profil ve hesap tercihlerinizi yönetin</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Kart 1: Profil */}
            <Card className="flex w-full flex-col">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil
                </CardTitle>
                <CardDescription>
                  Kullanıcı adı ve profil fotoğrafı navbar’daki menüde görünür. Fotoğraf 2MB’dan büyükse otomatik küçültülür.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <div className="space-y-2">
                  <label htmlFor="displayName" className="text-sm font-medium text-foreground">
                    Kullanıcı adı
                  </label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder={user?.email ?? 'İsim girin'}
                    maxLength={50}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    {displayName.length}/50 karakter. Boş bırakırsanız e-posta ön kısmı kullanılır.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">E-posta</label>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/50 px-3 py-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{user?.email ?? '—'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">E-posta giriş için kullanılır; buradan değiştirilemez.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Profil fotoğrafı</label>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted">
                      {photoBase64 ? (
                        <img src={photoBase64} alt="Profil" className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          Fotoğraf seç
                        </Button>
                        {photoBase64 && (
                          <Button type="button" variant="ghost" size="sm" onClick={handleRemovePhoto}>
                            Kaldır
                          </Button>
                        )}
                      </div>
                      <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>JPG, PNG veya GIF. 2MB üzeri resimler otomatik sıkıştırılır.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <div className="mt-auto pt-2">
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      'Profil kaydet'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Kart 2: Hesap & Tercihler */}
            <Card className="flex w-full flex-col">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Hesap & Tercihler
                </CardTitle>
                <CardDescription>
                  Hesap bilgileri ve uygulama tercihleri. Tema ve bildirimler navbar veya bu alanlardan yönetilebilir.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="h-4 w-4" />
                    Üyelik tarihi
                  </label>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                    {formatDate(creationTime)}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="h-4 w-4" />
                    Son giriş
                  </label>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                    {formatDate(lastSignInTime)}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Palette className="h-4 w-4" />
                    Tema
                  </label>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                    {themeLabel}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tema değiştirmek için navbar’daki güneş/ay ikonuna tıklayın.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Globe className="h-4 w-4" />
                    Dil
                  </label>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                    Türkçe
                  </div>
                  <p className="text-xs text-muted-foreground">Uygulama dili. Ek diller yakında eklenecek.</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Bell className="h-4 w-4" />
                    Bildirimler
                  </label>
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-center text-sm text-muted-foreground">
                    Maç hatırlatmaları ve bildirim tercihleri yakında buradan yönetilebilecek.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
