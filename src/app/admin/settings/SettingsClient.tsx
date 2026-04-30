"use client";

import { useState, useMemo } from "react";
import { Save, RefreshCw } from "lucide-react";
import { SystemConfig } from "@prisma/client";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

export function SettingsClient({ initialData }: { initialData: SystemConfig[] }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data, refetch, isLoading } = trpc.settings.list.useQuery(undefined, {
    initialData,
  });

  // Local state to track modifications before saving
  const [localValues, setLocalValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    initialData.forEach((item) => {
      init[item.id] = item.value;
    });
    return init;
  });

  // Keep local state in sync when data is refreshed
  useMemo(() => {
    if (data) {
      setLocalValues((prev) => {
        const next = { ...prev };
        data.forEach((item) => {
          // Only sync if we haven't modified it locally yet (simple approach)
          // For absolute safety, we just re-sync everything on refetch
          next[item.id] = item.value;
        });
        return next;
      });
    }
  }, [data]);

  const updateBulkMutation = trpc.settings.updateBulk.useMutation({
    onSuccess: () => {
      toast.success("Pengaturan sistem berhasil disimpan");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSave = () => {
    if (!data) return;
    const payload = data.map(item => ({
      id: item.id,
      key: item.key,
      value: localValues[item.id]
    }));
    updateBulkMutation.mutate(payload);
  };

  const handleValueChange = (id: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [id]: value }));
  };

  // Group settings by category
  const groupedSettings = useMemo(() => {
    if (!data) return {};
    return data.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, SystemConfig[]>);
  }, [data]);

  const CATEGORY_LABEL: Record<string, string> = {
    "security": "Keamanan & Autentikasi",
    "email": "Email Sistem",
    "general": "Umum",
  };

  return (
    <div className="animate-fadeUp">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="section-title-heritage" style={{ margin: 0 }}>PENGATURAN SISTEM</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading || updateBulkMutation.isPending}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "transparent",
              border: "1.5px solid var(--gold-500)", borderRadius: 6, cursor: (isRefreshing || isLoading) ? "not-allowed" : "pointer",
              fontFamily: '"Cinzel", serif', fontWeight: 600, fontSize: 12, color: "var(--navy-800)", letterSpacing: 0.5,
              opacity: (isRefreshing || isLoading) ? 0.6 : 1,
            }}
          >
            <RefreshCw size={14} style={{ animation: (isRefreshing || isLoading) ? "spin 0.8s linear infinite" : "none" }} />
            {isRefreshing ? "MEMUAT..." : "REFRESH"}
          </button>
          <button 
            onClick={handleSave} 
            disabled={updateBulkMutation.isPending}
            className="btn-heritage" 
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Save size={16} /> 
            {updateBulkMutation.isPending ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {Object.entries(groupedSettings).map(([category, items]) => (
          <div key={category} className="card-heritage" style={{ overflow: "hidden" }}>
            <div style={{ 
              background: "linear-gradient(90deg, rgba(214,178,90,.15), transparent)", 
              padding: "16px 24px", 
              borderBottom: "1px solid rgba(160,125,47,.2)" 
            }}>
              <h3 style={{ margin: 0, fontFamily: '"Cinzel", serif', fontSize: 18, fontWeight: 700, color: "var(--navy-900)" }}>
                {CATEGORY_LABEL[category] || category.toUpperCase()}
              </h3>
            </div>
            
            <div style={{ padding: "0 24px" }}>
              {items.map((item, index) => {
                const valueType = typeof item.value;
                const currentValue = localValues[item.id] ?? item.value;

                return (
                  <div key={item.id} style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "20px 0",
                    borderBottom: index < items.length - 1 ? "1px dashed rgba(160,125,47,.3)" : "none" 
                  }}>
                    <div style={{ flex: 1, paddingRight: 24 }}>
                      <div style={{ fontFamily: '"Manrope", sans-serif', fontSize: 14, fontWeight: 600, color: "var(--navy-900)" }}>
                        {item.description || item.key}
                      </div>
                      <div style={{ fontFamily: '"Manrope", sans-serif', fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
                        Key: <code style={{ background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>{item.key}</code>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0, width: 250 }}>
                      {valueType === "boolean" ? (
                        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                          <input 
                            type="checkbox" 
                            checked={Boolean(currentValue)} 
                            onChange={(e) => handleValueChange(item.id, e.target.checked)}
                            style={{ width: 18, height: 18, accentColor: "var(--gold-600)" }}
                          />
                          <span style={{ fontSize: 14, fontWeight: 600, color: currentValue ? "var(--green-700)" : "var(--ink-soft)" }}>
                            {currentValue ? "Aktif" : "Nonaktif"}
                          </span>
                        </label>
                      ) : valueType === "number" ? (
                        <input 
                          type="number" 
                          value={Number(currentValue)} 
                          onChange={(e) => handleValueChange(item.id, Number(e.target.value))}
                          className="input-heritage"
                        />
                      ) : (
                        <input 
                          type="text" 
                          value={String(currentValue)} 
                          onChange={(e) => handleValueChange(item.id, e.target.value)}
                          className="input-heritage"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
