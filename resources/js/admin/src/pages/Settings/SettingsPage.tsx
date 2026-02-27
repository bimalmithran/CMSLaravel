import { Save } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';

import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Textarea } from '../../../../components/ui/textarea';
import { MediaPicker } from '../../components/MediaPicker';
import { FullScreenLoader } from '../../components/ui/FullScreenLoader';
import { apiFetch } from '../../lib/api';
import type { Setting } from '../../types/setting';

export function SettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    async function loadSettings() {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<Setting[]>('/api/v1/admin/settings');
            if (!res.success) {
                setError(res.message || 'Failed to load settings');
                return;
            }
            setSettings(res.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadSettings();
    }, []);

    const groups = useMemo(() => {
        const uniqueGroups = Array.from(new Set(settings.map((s) => s.group)));
        return uniqueGroups.sort();
    }, [settings]);

    function handleValueChange(id: number, newValue: string) {
        setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, value: newValue, media_id: s.type === 'image' ? s.media_id : null } : s)));
        setSuccessMsg(null);
    }

    function handleImageChange(id: number, media: { id: number; path: string } | null) {
        setSettings((prev) =>
            prev.map((s) =>
                s.id === id
                    ? { ...s, value: media?.path ?? null, media_id: media?.id ?? null }
                    : s,
            ),
        );
        setSuccessMsg(null);
    }

    async function saveSettings() {
        setSaving(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const res = await apiFetch<unknown>('/api/v1/admin/settings/bulk', {
                method: 'PUT',
                json: {
                    settings: settings.map((setting) => ({
                        id: setting.id,
                        value: setting.value,
                        media_id: setting.type === 'image' ? setting.media_id : null,
                    })),
                },
            });
            if (!res.success) throw new Error(res.message || 'Failed to save');
            setSuccessMsg('Settings updated successfully.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    }

    const formatLabel = (key: string) => {
        return key.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (loading) {
        return <div className="p-4 text-sm text-muted-foreground">Loading settings...</div>;
    }

    return (
        <div className="mx-auto max-w-5xl space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-lg font-semibold">Global Settings</div>
                    <div className="text-sm text-muted-foreground">Manage your site's identity, contact details, and configurations.</div>
                </div>
                <Button onClick={saveSettings} disabled={saving} className="cursor-pointer">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            {successMsg && <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">{successMsg}</div>}

            {groups.length > 0 ? (
                <Tabs defaultValue={groups[0]} className="w-full">
                    <TabsList className="mb-4">
                        {groups.map((group) => (
                            <TabsTrigger key={group} value={group} className="cursor-pointer capitalize">
                                {group}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {groups.map((group) => (
                        <TabsContent key={group} value={group}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="capitalize">{group} Settings</CardTitle>
                                    <CardDescription>Update the {group} configurations for your application.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {settings.filter((s) => s.group === group).map((setting) => (
                                        <div key={setting.id} className="max-w-2xl space-y-2">
                                            <Label htmlFor={`setting-${setting.id}`}>{formatLabel(setting.key)}</Label>
                                            {setting.type === 'textarea' ? (
                                                <Textarea id={`setting-${setting.id}`} value={setting.value || ''} onChange={(e) => handleValueChange(setting.id, e.target.value)} rows={4} />
                                            ) : setting.type === 'image' ? (
                                                <MediaPicker
                                                    value={setting.value || ''}
                                                    onSelect={(url) => handleValueChange(setting.id, url)}
                                                    onSelectMedia={(media) => handleImageChange(setting.id, media)}
                                                />
                                            ) : (
                                                <Input id={`setting-${setting.id}`} value={setting.value || ''} onChange={(e) => handleValueChange(setting.id, e.target.value)} />
                                            )}
                                            <p className="font-mono text-xs text-muted-foreground">Key: {setting.key}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <div className="text-sm text-muted-foreground">No settings found in the database.</div>
            )}

            <FullScreenLoader open={saving} text="Saving configuration..." />
        </div>
    );
}
