"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings, 
  Save,
  Mail,
  Globe,
  Shield,
  Bell,
  FileText,
  Loader2
} from "lucide-react";
import { getSystemSettings, updateSettingsGroup, updateAllSettings } from "./actions";
import { toast } from "sonner";

export default function SystemSettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "",
    platformUrl: "",
    supportEmail: "",
    adminEmail: "",
    timezone: "UTC",
    language: "en",
    maintenanceMode: false
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    fromName: "",
    fromEmail: ""
  });

  const [notificationSettings, setNotificationSettings] = useState({
    applicationSubmitted: false,
    applicationApproved: false,
    certificationIssued: false,
    userRegistered: false,
    systemAlerts: false,
    weeklyReports: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "30",
    passwordMinLength: "8",
    requireSpecialChar: false,
    requireNumber: false,
    twoFactorAuth: false,
    loginAttempts: "5"
  });

  const [applicationSettings, setApplicationSettings] = useState({
    autoApproval: false,
    reviewDeadline: "7",
    maxFileSize: "10",
    allowedFileTypes: "",
    requireDocuments: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const result = await getSystemSettings();
      if (result.success && result.settings) {
        if (result.settings.general) setGeneralSettings(result.settings.general);
        if (result.settings.email) setEmailSettings(result.settings.email);
        if (result.settings.notifications) setNotificationSettings(result.settings.notifications);
        if (result.settings.security) setSecuritySettings(result.settings.security);
        if (result.settings.application) setApplicationSettings(result.settings.application);
      } else if (!result.success) {
        toast.error("Internal configuration error syncing nodes.");
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSaveGeneral = async () => {
    setSaving("general");
    const result = await updateSettingsGroup("general", generalSettings);
    if (result.success) toast.success("Core node settings updated successfully.");
    else toast.error("Failed to commit settings to node.");
    setSaving(null);
  };

  const handleSaveEmail = async () => {
    setSaving("email");
    const result = await updateSettingsGroup("email", emailSettings);
    if (result.success) toast.success("SMTP relay parameters updated.");
    else toast.error("Relay configuration rejected.");
    setSaving(null);
  };

  const handleSaveNotifications = async () => {
    setSaving("notifications");
    const result = await updateSettingsGroup("notifications", notificationSettings);
    if (result.success) toast.success("Alert matrix synchronized.");
    else toast.error("Matrix update failed.");
    setSaving(null);
  };

  const handleSaveSecurity = async () => {
    setSaving("security");
    const result = await updateSettingsGroup("security", securitySettings);
    if (result.success) toast.success("Security protocols updated.");
    else toast.error("Protocol error.");
    setSaving(null);
  };

  const handleSaveApplication = async () => {
    setSaving("application");
    const result = await updateSettingsGroup("application", applicationSettings);
    if (result.success) toast.success("Workflow logic optimized.");
    else toast.error("Optimization failed.");
    setSaving(null);
  };

  const handleSaveAll = async () => {
    setSaving("all");
    const all = {
      general: generalSettings,
      email: emailSettings,
      notifications: notificationSettings,
      security: securitySettings,
      application: applicationSettings
    };
    const result = await updateAllSettings(all);
    if (result.success) toast.success("Platform synchronized across all nodes.");
    else toast.error("Global synchronization failed.");
    setSaving(null);
  };

  const handleTestEmail = () => {
    toast.info("SMTP handshake initiated. Sending test dispatch...");
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-mint-teal opacity-60" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Node Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-brand-deep-dark uppercase">System Configuration</h1>
        </div>
        <Button 
          onClick={handleSaveAll}
          disabled={saving === "all"} 
          className="bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-brand-mint-teal/20 transition-all hover:scale-105 active:scale-95"
        >
          {saving === "all" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Synchronize All Nodes
        </Button>
      </div>

      {/* General Settings */}
      <Card className="border-2 rounded-3xl overflow-hidden shadow-sm border-slate-100 bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-deep-dark rounded-xl">
              <Settings className="h-5 w-5 text-brand-startup-amber" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-brand-deep-dark">Global Core Settings</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400">Primary platform identity and operational parameters</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="platformName" className="text-xs font-black uppercase tracking-widest text-slate-500">Platform Identity</Label>
              <Input
                id="platformName"
                className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                value={generalSettings.platformName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platformUrl" className="text-xs font-black uppercase tracking-widest text-slate-500">Operational URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3.5 h-4 w-4 text-brand-mint-teal/60" />
                <Input
                  id="platformUrl"
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                  value={generalSettings.platformUrl}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, platformUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="supportEmail" className="text-xs font-black uppercase tracking-widest text-slate-500">Support Communications</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-brand-mint-teal/60" />
                <Input
                  id="supportEmail"
                  type="email"
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                  value={generalSettings.supportEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="text-xs font-black uppercase tracking-widest text-slate-500">Master Administrator Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-brand-mint-teal/60" />
                <Input
                  id="adminEmail"
                  type="email"
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                  value={generalSettings.adminEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, adminEmail: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-xs font-black uppercase tracking-widest text-slate-500">System Chronology (Timezone)</Label>
              <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                  <SelectItem value="Africa/Addis_Ababa" className="font-semibold">Africa/Addis Ababa (EAT)</SelectItem>
                  <SelectItem value="UTC" className="font-semibold">UTC Standard</SelectItem>
                  <SelectItem value="Africa/Nairobi" className="font-semibold">Africa/Nairobi (EAT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language" className="text-xs font-black uppercase tracking-widest text-slate-500">Default Interface Linguistics</Label>
              <Select value={generalSettings.language} onValueChange={(value) => setGeneralSettings({ ...generalSettings, language: value })}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                  <SelectItem value="en" className="font-semibold">English (Legacy)</SelectItem>
                  <SelectItem value="am" className="font-semibold">Amharic (Native)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between p-5 border-2 border-brand-mint-teal/5 bg-brand-mint-teal/[0.02] rounded-2xl transition-all hover:bg-brand-mint-teal/[0.04]">
            <div className="space-y-0.5">
              <Label className="text-sm font-black text-brand-deep-dark">Maintenance Lockdown</Label>
              <p className="text-xs font-bold text-slate-400">
                Immediately suspend all external node access for system maintenance
              </p>
            </div>
            <Switch
              className="data-[state=checked]:bg-brand-mint-teal"
              checked={generalSettings.maintenanceMode}
              onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveGeneral} 
              disabled={saving === "general"}
              className="bg-brand-deep-dark hover:bg-brand-deep-dark/90 text-white font-bold h-11 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {saving === "general" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4 text-brand-startup-amber" />}
              Update Core Node
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="border-2 rounded-3xl overflow-hidden shadow-sm border-slate-100 bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-deep-dark rounded-xl">
              <Mail className="h-5 w-5 text-brand-startup-amber" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-brand-deep-dark">SMTP Communications</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400">Configure outbound relay and automated notification dispatch</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="smtpHost" className="text-xs font-black uppercase tracking-widest text-slate-500">Relay Host</Label>
              <Input
                id="smtpHost"
                className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort" className="text-xs font-black uppercase tracking-widest text-slate-500">Port Authorization</Label>
              <Input
                id="smtpPort"
                className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="smtpUsername" className="text-xs font-black uppercase tracking-widest text-slate-500">Security Identifier (Username)</Label>
              <Input
                id="smtpUsername"
                className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                value={emailSettings.smtpUsername}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword" className="text-xs font-black uppercase tracking-widest text-slate-500">Access Key (MTLS/Password)</Label>
              <Input
                id="smtpPassword"
                type="password"
                className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fromName" className="text-xs font-black uppercase tracking-widest text-slate-500">Display Identity</Label>
              <Input
                id="fromName"
                className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                value={emailSettings.fromName}
                onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail" className="text-xs font-black uppercase tracking-widest text-slate-500">Dispatch Address</Label>
              <Input
                id="fromEmail"
                type="email"
                className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleTestEmail} className="h-11 px-8 rounded-xl font-bold text-xs border-brand-mint-teal text-brand-mint-teal hover:bg-brand-mint-teal/10">
              Execute Handshake Test
            </Button>
            <Button 
              onClick={handleSaveEmail} 
              disabled={saving === "email"}
              className="bg-brand-deep-dark hover:bg-brand-deep-dark/90 text-white font-bold h-11 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {saving === "email" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4 text-brand-startup-amber" />}
              Commit SMTP Config
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-2 rounded-3xl overflow-hidden shadow-sm border-slate-100 bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-deep-dark rounded-xl">
              <Bell className="h-5 w-5 text-brand-startup-amber" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-brand-deep-dark">Alert Matrix</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400">Configure multi-channel automated notification protocols</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-2xl border-slate-50 bg-slate-50/30 transition-all hover:bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-brand-deep-dark">Application Submissions</Label>
                <p className="text-[10px] font-medium text-slate-400">Notify admins on new incoming requests</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-brand-mint-teal"
                checked={notificationSettings.applicationSubmitted}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, applicationSubmitted: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl border-slate-50 bg-slate-50/30 transition-all hover:bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-brand-deep-dark">Approval Confirmations</Label>
                <p className="text-[10px] font-medium text-slate-400">Dispatch success alerts to applicants</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-brand-mint-teal"
                checked={notificationSettings.applicationApproved}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, applicationApproved: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl border-slate-50 bg-slate-50/30 transition-all hover:bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-brand-deep-dark">Credential Issuance</Label>
                <p className="text-[10px] font-medium text-slate-400">Alert users when certificates are generated</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-brand-mint-teal"
                checked={notificationSettings.certificationIssued}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, certificationIssued: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl border-slate-50 bg-slate-50/30 transition-all hover:bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-brand-deep-dark">Identity Registration</Label>
                <p className="text-[10px] font-medium text-slate-400">Verify new ecosystem user onboarding</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-brand-mint-teal"
                checked={notificationSettings.userRegistered}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, userRegistered: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl border-slate-50 bg-slate-50/30 transition-all hover:bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-brand-deep-dark">Critical System Failure</Label>
                <p className="text-[10px] font-medium text-slate-400">Priority alerts for infrastructure issues</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-brand-mint-teal"
                checked={notificationSettings.systemAlerts}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl border-slate-50 bg-slate-50/30 transition-all hover:bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-brand-deep-dark">Analytical Reports</Label>
                <p className="text-[10px] font-medium text-slate-400">Weekly operational summary synthesis</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-brand-mint-teal"
                checked={notificationSettings.weeklyReports}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyReports: checked })}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveNotifications} 
              disabled={saving === "notifications"}
              className="bg-brand-deep-dark hover:bg-brand-deep-dark/90 text-white font-bold h-11 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {saving === "notifications" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4 text-brand-startup-amber" />}
              Update Alert Protocols
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-2 rounded-3xl overflow-hidden shadow-sm border-slate-100 bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-deep-dark rounded-xl">
              <Shield className="h-5 w-5 text-brand-startup-amber" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-brand-deep-dark">Vault Security Protocols</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400">Establish authentication hardening and session encryption standards</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout" className="text-xs font-black uppercase tracking-widest text-slate-500">Node Session Timeout (Min)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength" className="text-xs font-black uppercase tracking-widest text-slate-500">Minimum Identity Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                value={securitySettings.passwordMinLength}
                onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-2xl border-slate-50 bg-slate-50/30 transition-all hover:bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-brand-deep-dark">Complex Characters</Label>
                <p className="text-[10px] font-medium text-slate-400">Strict symbolic character requirements</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-brand-mint-teal"
                checked={securitySettings.requireSpecialChar}
                onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireSpecialChar: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl border-slate-50 bg-slate-50/30 transition-all hover:bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-brand-deep-dark">Numerical Enforcement</Label>
                <p className="text-[10px] font-medium text-slate-400">Mandatory numeric inclusion in identity strings</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-brand-mint-teal"
                checked={securitySettings.requireNumber}
                onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireNumber: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl border-slate-50 bg-slate-50/30 transition-all hover:bg-slate-50 md:col-span-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-brand-deep-dark">Multi-Factor Authentication (MFA)</Label>
                <p className="text-[10px] font-medium text-slate-400">Global enforcement of cryptographic second-factor validation</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-brand-mint-teal"
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loginAttempts" className="text-xs font-black uppercase tracking-widest text-slate-500">Threshold for Lockdown (Attempts)</Label>
            <Input
              id="loginAttempts"
              type="number"
              className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal w-48"
              value={securitySettings.loginAttempts}
              onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: e.target.value })}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveSecurity} 
              disabled={saving === "security"}
              className="bg-brand-deep-dark hover:bg-brand-deep-dark/90 text-white font-bold h-11 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {saving === "security" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4 text-brand-startup-amber" />}
              Commit Security Policies
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card className="border-2 rounded-3xl overflow-hidden shadow-sm border-slate-100 bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-deep-dark rounded-xl">
              <FileText className="h-5 w-5 text-brand-startup-amber" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-brand-deep-dark">Workflow Logic</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400">Define algorithmic processing and document intake criteria</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-2xl border-slate-50 bg-slate-50/30 transition-all hover:bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-brand-deep-dark">Algorithmic Autonomy (Auto-Approval)</Label>
                <p className="text-[10px] font-medium text-slate-400">Automatically validate requests meeting all metadata criteria</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-brand-mint-teal"
                checked={applicationSettings.autoApproval}
                onCheckedChange={(checked) => setApplicationSettings({ ...applicationSettings, autoApproval: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-2xl border-slate-50 bg-slate-50/30 transition-all hover:bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-brand-deep-dark">Mandatory Data Intake</Label>
                <p className="text-[10px] font-medium text-slate-400">Require verifiable document uploads for request processing</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-brand-mint-teal"
                checked={applicationSettings.requireDocuments}
                onCheckedChange={(checked) => setApplicationSettings({ ...applicationSettings, requireDocuments: checked })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reviewDeadline" className="text-xs font-black uppercase tracking-widest text-slate-500">Processing Threshold (Days)</Label>
              <Input
                id="reviewDeadline"
                type="number"
                className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                value={applicationSettings.reviewDeadline}
                onChange={(e) => setApplicationSettings({ ...applicationSettings, reviewDeadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxFileSize" className="text-xs font-black uppercase tracking-widest text-slate-500">Ingestion Payload Cap (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
                value={applicationSettings.maxFileSize}
                onChange={(e) => setApplicationSettings({ ...applicationSettings, maxFileSize: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="allowedFileTypes" className="text-xs font-black uppercase tracking-widest text-slate-500">Permitted Format Identifiers</Label>
            <Input
              id="allowedFileTypes"
              className="h-11 rounded-xl border-slate-200 focus:ring-brand-mint-teal"
              value={applicationSettings.allowedFileTypes}
              onChange={(e) => setApplicationSettings({ ...applicationSettings, allowedFileTypes: e.target.value })}
              placeholder="pdf,doc,docx,jpg,png"
            />
            <p className="text-[10px] font-bold text-slate-400 italic mt-1.5">Sequential comma-separated format filters</p>
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveApplication} 
              disabled={saving === "application"}
              className="bg-brand-deep-dark hover:bg-brand-deep-dark/90 text-white font-bold h-11 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {saving === "application" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4 text-brand-startup-amber" />}
              Store Logic Parameters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
