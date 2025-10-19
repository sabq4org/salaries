"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  category: string;
  label: string;
  description: string | null;
  dataType: string;
  isEditable: boolean;
  updatedBy: string | null;
  updatedByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("فشل في تحميل الإعدادات");
      const data = await response.json();
      setSettings(data);
      
      // تهيئة القيم المعدلة
      const initialValues: Record<string, string> = {};
      data.forEach((setting: SystemSetting) => {
        initialValues[setting.key] = setting.value;
      });
      setEditedValues(initialValues);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (key: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/settings?key=${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: editedValues[key],
          userId: "admin",
          userName: "المسؤول",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في حفظ الإعداد");
      }

      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعداد بنجاح",
      });

      fetchSettings();
    } catch (error: any) {
      console.error("Error saving setting:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في حفظ الإعداد",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async (category: string) => {
    try {
      setSaving(true);
      const categorySettings = settings.filter(s => s.category === category && s.isEditable);
      
      for (const setting of categorySettings) {
        if (editedValues[setting.key] !== setting.value) {
          await fetch(`/api/settings?key=${setting.key}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              value: editedValues[setting.key],
              userId: "admin",
              userName: "المسؤول",
            }),
          });
        }
      }

      toast({
        title: "تم الحفظ",
        description: "تم حفظ جميع الإعدادات بنجاح",
      });

      fetchSettings();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const value = editedValues[setting.key] || setting.value;
    const hasChanged = value !== setting.value;

    return (
      <div key={setting.key} className="space-y-2 p-4 bg-muted/30 rounded-lg">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Label htmlFor={setting.key} className="text-sm font-semibold">
              {setting.label}
            </Label>
            {setting.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {setting.description}
              </p>
            )}
          </div>
          {hasChanged && (
            <Button
              size="sm"
              onClick={() => handleSave(setting.key)}
              disabled={saving || !setting.isEditable}
            >
              <Save className="h-3 w-3 ml-1" />
              حفظ
            </Button>
          )}
        </div>
        <Input
          id={setting.key}
          type={setting.dataType === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleValueChange(setting.key, e.target.value)}
          disabled={!setting.isEditable}
          className={hasChanged ? 'border-primary' : ''}
        />
      </div>
    );
  };

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      insurance: "التأمينات الاجتماعية",
      tax: "الضرائب",
      leave: "الإجازات",
      deduction: "الخصومات",
      general: "إعدادات عامة",
    };
    return titles[category] || category;
  };

  const getCategoryDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      insurance: "إعدادات نسب التأمينات الاجتماعية والطبية",
      tax: "إعدادات الضرائب وضريبة القيمة المضافة",
      leave: "إعدادات الإجازات السنوية والمرضية",
      deduction: "إعدادات الغرامات والخصومات",
      general: "الإعدادات العامة للنظام",
    };
    return descriptions[category] || "";
  };

  const categories = Array.from(new Set(settings.map(s => s.category)));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Settings2 className="h-8 w-8" />
              إعدادات النظام
            </h1>
            <p className="text-muted-foreground mt-1">
              إدارة الإعدادات العامة ومعدلات التأمينات والضرائب
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {getCategoryTitle(category)}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{getCategoryTitle(category)}</CardTitle>
                      <CardDescription>
                        {getCategoryDescription(category)}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => handleSaveAll(category)}
                      disabled={saving}
                    >
                      <Save className="h-4 w-4 ml-2" />
                      حفظ الكل
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings
                    .filter(s => s.category === category)
                    .map(setting => renderSettingInput(setting))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Settings2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  ملاحظة هامة
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  التغييرات على الإعدادات ستؤثر على جميع الحسابات المستقبلية. يُنصح بمراجعة
                  التغييرات بعناية قبل حفظها. يتم تسجيل جميع التغييرات في سجل التدقيق.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

