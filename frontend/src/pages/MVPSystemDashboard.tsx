import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/i18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartText } from '../i18n/smartTranslation';
import { 
  Plus, 
  Users, 
  Database, 
  CreditCard, 
  Key,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Globe,
  Smartphone
} from 'lucide-react';

interface ClientOnboardingData {
  client_name: string;
  contact_email: string;
  contact_phone?: string;
  company_name?: string;
  country?: string;
  timezone?: string;
  device_fingerprint: string;
  hardware_signature: string;
}

interface OnboardingStatistics {
  totalClients: number;
  activeClients: number;
  trialClients: number;
  licensedClients: number;
  suspendedClients: number;
  newClientsThisMonth: number;
  newClientsThisWeek: number;
}

interface LicensePricing {
  [key: string]: {
    credits: number;
    duration: number;
    price: number;
  };
}

const MVPSystemDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState<OnboardingStatistics | null>(null);
  const [licensePricing, setLicensePricing] = useState<LicensePricing>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboardForm, setShowOnboardForm] = useState(false);
  const [onboardingData, setOnboardingData] = useState<ClientOnboardingData>({
    client_name: '',
    contact_email: '',
    contact_phone: '',
    company_name: '',
    country: '',
    timezone: '',
    device_fingerprint: '',
    hardware_signature: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Fetch onboarding statistics
      const statsResponse = await fetch('/api/v1/mvp-system/onboarding-statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData.data);
      }

      // Fetch license pricing
      const pricingResponse = await fetch('/api/v1/mvp-system/license-pricing', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (pricingResponse.ok) {
        const pricingData = await pricingResponse.json();
        setLicensePricing(pricingData.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/v1/mvp-system/onboard-client', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(onboardingData)
      });

      if (!response.ok) {
        throw new Error('Failed to onboard client');
      }

      const result = await response.json();
      alert(`Client onboarded successfully! Client ID: ${result.data.clientId}`);
      
      // Reset form
      setOnboardingData({
        client_name: '',
        contact_email: '',
        contact_phone: '',
        company_name: '',
        country: '',
        timezone: '',
        device_fingerprint: '',
        hardware_signature: ''
      });
      setShowOnboardForm(false);
      
      // Refresh data
      fetchDashboardData();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to onboard client');
    }
  };

  const generateDeviceFingerprint = () => {
    const fingerprint = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setOnboardingData({ ...onboardingData, device_fingerprint: fingerprint });
  };

  const generateHardwareSignature = () => {
    const signature = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setOnboardingData({ ...onboardingData, hardware_signature: signature });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.welcome}</h1>
          <p className="text-gray-600">{t.dashboard.statistics}</p>
        </div>
        <Button onClick={() => setShowOnboardForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t.common.create}
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.common.total}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.newClientsThisWeek} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.users.active}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.activeClients}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.licensedClients} licensed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.common.status}</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statistics.trialClients}</div>
              <SmartText tag="p" className="text-xs text-muted-foreground">50 credits each</SmartText>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.common.status}</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.suspendedClients}</div>
              <SmartText tag="p" className="text-xs text-muted-foreground">Need attention</SmartText>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="onboarding">Client Onboarding</TabsTrigger>
          <TabsTrigger value="licenses">License Management</TabsTrigger>
          <TabsTrigger value="trial">Trial System</TabsTrigger>
          <TabsTrigger value="databases">Database Management</TabsTrigger>
        </TabsList>

        {/* System Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <SmartText tag="div" className="font-medium">Master Server (France)</SmartText>
                      <SmartText tag="div" className="text-sm text-gray-600">Central control panel</SmartText>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-green-600" />
                    <div>
                      <SmartText tag="div" className="font-medium">Separate Database per Client</SmartText>
                      <SmartText tag="div" className="text-sm text-gray-600">Complete data isolation</SmartText>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <div>
                      <SmartText tag="div" className="font-medium">Desktop Apps Worldwide</SmartText>
                      <SmartText tag="div" className="text-sm text-gray-600">Offline-first design</SmartText>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-orange-600" />
                    <div>
                      <SmartText tag="div" className="font-medium">License Activation</SmartText>
                      <SmartText tag="div" className="text-sm text-gray-600">Email/Phone based</SmartText>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <SmartText tag="div" className="text-sm">Install App → Guest Screen</SmartText>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <SmartText tag="div" className="text-sm">Use POS → Credits Consumed</SmartText>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <SmartText tag="div" className="text-sm">Credits End → System Locks</SmartText>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <SmartText tag="div" className="text-sm">Contact Admin → License Generated</SmartText>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">5</div>
                    <SmartText tag="div" className="text-sm">Enter License → System Activates</SmartText>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Client Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Onboarding Process</CardTitle>
            </CardHeader>
            <CardContent>
              {showOnboardForm ? (
                <form onSubmit={handleOnboardClient} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_name">Client Name *</Label>
                      <Input
                        id="client_name"
                        value={onboardingData.client_name}
                        onChange={(e) => setOnboardingData({...onboardingData, client_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_email">Contact Email *</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={onboardingData.contact_email}
                        onChange={(e) => setOnboardingData({...onboardingData, contact_email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_phone">Contact Phone</Label>
                      <Input
                        id="contact_phone"
                        value={onboardingData.contact_phone}
                        onChange={(e) => setOnboardingData({...onboardingData, contact_phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        value={onboardingData.company_name}
                        onChange={(e) => setOnboardingData({...onboardingData, company_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={onboardingData.country}
                        onChange={(e) => setOnboardingData({...onboardingData, country: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={onboardingData.timezone}
                        onChange={(e) => setOnboardingData({...onboardingData, timezone: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="device_fingerprint">Device Fingerprint *</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="device_fingerprint"
                          value={onboardingData.device_fingerprint}
                          onChange={(e) => setOnboardingData({...onboardingData, device_fingerprint: e.target.value})}
                          required
                        />
                        <Button type="button" variant="outline" onClick={generateDeviceFingerprint}>
                          Generate
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="hardware_signature">Hardware Signature *</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="hardware_signature"
                          value={onboardingData.hardware_signature}
                          onChange={(e) => setOnboardingData({...onboardingData, hardware_signature: e.target.value})}
                          required
                        />
                        <Button type="button" variant="outline" onClick={generateHardwareSignature}>
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowOnboardForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit"><SmartText>Onboard Client</SmartText></Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <SmartText tag="h3" className="text-lg font-semibold text-gray-900 mb-2">Onboard New Client</SmartText>
                  <SmartText tag="p" className="text-gray-600 mb-4">Create a new client instance with separate database and trial session</SmartText>
                  <Button onClick={() => setShowOnboardForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Start Onboarding
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* License Management Tab */}
        <TabsContent value="licenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>License Pricing & Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(licensePricing).map(([type, config]) => (
                    <div key={type} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{type}</h3>
                        <div className="text-3xl font-bold text-blue-600 my-2">
                          {formatCurrency(config.price)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{config.credits.toLocaleString()} credits</div>
                          <div>{config.duration} month{config.duration > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <SmartText tag="h4" className="font-semibold text-blue-900 mb-2">License Activation Process</SmartText>
                  <div className="text-sm text-blue-800 space-y-1">
                    <SmartText tag="div">1. Client contacts master admin via email/phone</SmartText>
                    <SmartText tag="div">2. Master admin generates unique license key</SmartText>
                    <SmartText tag="div">3. License key sent to client via email/SMS</SmartText>
                    <SmartText tag="div">4. Client enters license key in their POS app</SmartText>
                    <SmartText tag="div">5. System activates with full features</SmartText>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trial System Tab */}
        <TabsContent value="trial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trial System Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CreditCard className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">50</div>
                    <SmartText tag="div" className="text-sm text-green-600">Initial Credits</SmartText>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">1-10</div>
                    <SmartText tag="div" className="text-sm text-blue-600">Credits per Operation</SmartText>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">0</div>
                    <SmartText tag="div" className="text-sm text-yellow-600">System Locks</SmartText>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <SmartText tag="h4" className="font-semibold text-gray-900 mb-2">Credit Consumption Rates</SmartText>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <SmartText tag="div" className="font-medium">Free Operations:</SmartText>
                      <SmartText tag="div" className="text-gray-600">Product View, Product Search</SmartText>
                    </div>
                    <div>
                      <SmartText tag="div" className="font-medium">1 Credit:</SmartText>
                      <SmartText tag="div" className="text-gray-600">Sale Create, Product Update, Product Delete</SmartText>
                    </div>
                    <div>
                      <SmartText tag="div" className="font-medium">2 Credits:</SmartText>
                      <SmartText tag="div" className="text-gray-600">Product Create, Inventory Adjust</SmartText>
                    </div>
                    <div>
                      <SmartText tag="div" className="font-medium">3-10 Credits:</SmartText>
                      <SmartText tag="div" className="text-gray-600">Reports, User Management, System Settings</SmartText>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Management Tab */}
        <TabsContent value="databases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Isolation System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <SmartText tag="h4" className="font-semibold mb-2">Database Strategy</SmartText>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-green-600" />
                        <SmartText tag="span">Separate database per client</SmartText>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-blue-600" />
                        <SmartText tag="span">Complete data isolation</SmartText>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-purple-600" />
                        <SmartText tag="span">Automatic backup & restore</SmartText>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-orange-600" />
                        <SmartText tag="span">Scalable architecture</SmartText>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <SmartText tag="h4" className="font-semibold mb-2">Database Naming Convention</SmartText>
                    <div className="space-y-2 text-sm">
                      <div className="font-mono bg-gray-100 p-2 rounded">
                        pos_client_{`{client_id}`}
                      </div>
                      <SmartText tag="div" className="text-gray-600">Example: pos_client_565c55ab_df58_417e_9baa_d1b2b454335b</SmartText>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <SmartText tag="h4" className="font-semibold text-blue-900 mb-2">Database Operations</SmartText>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="justify-start">
                      <Database className="w-4 h-4 mr-2" />
                      List All Databases
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      Database Health Check
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Usage Statistics
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600">{error}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MVPSystemDashboard;
