"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFeatureControl } from "@/contexts/FeatureControlContext";
import { 
  Settings, 
  Users, 
  Building2, 
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Save
} from "lucide-react";
import { toast } from "sonner";

export default function FeatureControlPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { features, updateFeature, updateAllForRole } = useFeatureControl();

  const categories = ["all", "Dashboard", "Startup", "Ecosystem Builder", "Stakeholder", "Community", "System"];

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || feature.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getActiveCount = (role: 'startup' | 'ecosystemBuilder' | 'stakeholder' | 'admin') => {
    return features.filter(f => f.roles[role]).length;
  };

  const handleSaveChanges = () => {
    toast.success("Feature settings saved successfully!");
  };

  const toggleFeature = (featureId: string, role: 'startup' | 'ecosystemBuilder' | 'stakeholder' | 'admin') => {
    const feature = features.find(f => f.id === featureId);
    if (feature) {
      updateFeature(featureId, role, !feature.roles[role]);
    }
  };

  const toggleAllForRole = (role: 'startup' | 'ecosystemBuilder' | 'stakeholder' | 'admin', enabled: boolean) => {
    updateAllForRole(role, enabled);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Control</h1>
          <p className="text-muted-foreground">
            Manage feature access for different user roles
          </p>
        </div>
        <Button onClick={handleSaveChanges} className="bg-purple-600 hover:bg-purple-700">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Role Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Startups</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveCount('startup')}</div>
            <p className="text-xs text-muted-foreground">features enabled</p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleAllForRole('startup', true)}
                className="text-xs"
              >
                Enable All
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleAllForRole('startup', false)}
                className="text-xs"
              >
                Disable All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ecosystem Builders</CardTitle>
            <Building2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveCount('ecosystemBuilder')}</div>
            <p className="text-xs text-muted-foreground">features enabled</p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleAllForRole('ecosystemBuilder', true)}
                className="text-xs"
              >
                Enable All
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleAllForRole('ecosystemBuilder', false)}
                className="text-xs"
              >
                Disable All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stakeholders</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveCount('stakeholder')}</div>
            <p className="text-xs text-muted-foreground">features enabled</p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleAllForRole('stakeholder', true)}
                className="text-xs"
              >
                Enable All
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleAllForRole('stakeholder', false)}
                className="text-xs"
              >
                Disable All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Settings className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveCount('admin')}</div>
            <p className="text-xs text-muted-foreground">features enabled</p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleAllForRole('admin', true)}
                className="text-xs"
              >
                Enable All
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toggleAllForRole('admin', false)}
                className="text-xs"
              >
                Disable All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Management</CardTitle>
          <CardDescription>Control which features are accessible to each user role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Features Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Startups
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ecosystem Builders
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stakeholders
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admins
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeatures.map((feature) => (
                  <tr key={feature.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                        <p className="text-xs text-gray-500">{feature.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="text-xs">
                        {feature.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={feature.roles.startup}
                          onCheckedChange={() => toggleFeature(feature.id, 'startup')}
                        />
                        {feature.roles.startup ? (
                          <CheckCircle className="h-4 w-4 text-purple-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={feature.roles.ecosystemBuilder}
                          onCheckedChange={() => toggleFeature(feature.id, 'ecosystemBuilder')}
                        />
                        {feature.roles.ecosystemBuilder ? (
                          <CheckCircle className="h-4 w-4 text-purple-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={feature.roles.stakeholder}
                          onCheckedChange={() => toggleFeature(feature.id, 'stakeholder')}
                        />
                        {feature.roles.stakeholder ? (
                          <CheckCircle className="h-4 w-4 text-purple-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={feature.roles.admin}
                          onCheckedChange={() => toggleFeature(feature.id, 'admin')}
                        />
                        {feature.roles.admin ? (
                          <CheckCircle className="h-4 w-4 text-purple-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No features found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
