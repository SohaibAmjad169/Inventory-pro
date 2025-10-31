import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartText, useSmartPlaceholder } from '../i18n/smartTranslation';
import { 
  Plus, 
  Search, 
  Users, 
  Mail, 
  Phone,
  MapPin,
  Building,
  Calendar,
  Activity,
  CreditCard,
  MessageSquare,
  Settings,
  Eye
} from 'lucide-react';

interface ClientInstance {
  id: string;
  client_name: string;
  client_code: string;
  device_fingerprint: string;
  hardware_signature: string;
  status: string;
  trial_guest_id?: string;
  license_key_id?: string;
  contact_email: string;
  contact_phone?: string;
  company_name?: string;
  country?: string;
  timezone?: string;
  first_seen_at: string;
  last_seen_at: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
  license_key?: {
    id: string;
    license_type: string;
    status: string;
    max_credits?: number;
    current_credits?: number;
    features?: string;
    expires_at?: string;
  };
  usage_stats?: Array<{
    id: string;
    date: string;
    credits_consumed: number;
    invoices_created: number;
    sales_amount: number;
    active_users: number;
    login_count: number;
    sync_count: number;
  }>;
}

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<ClientInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientInstance | null>(null);

  // Smart placeholder hooks
  const searchPlaceholder = useSmartPlaceholder('Search clients...');

  // Add client form state
  const [newClient, setNewClient] = useState({
    client_name: '',
    contact_email: '',
    contact_phone: '',
    company_name: '',
    country: '',
    timezone: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/v1/client-management/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await response.json();
      setClients(data.data.clients || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/v1/client-management/clients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newClient)
      });

      if (!response.ok) {
        throw new Error('Failed to add client');
      }

      await fetchClients();
      setShowAddClient(false);
      setNewClient({
        client_name: '',
        contact_email: '',
        contact_phone: '',
        company_name: '',
        country: '',
        timezone: ''
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add client');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', label: 'Active' },
      'TRIAL': { color: 'bg-yellow-100 text-yellow-800', label: 'Trial' },
      'INACTIVE': { color: 'bg-red-100 text-red-800', label: 'Inactive' },
      'SUSPENDED': { color: 'bg-gray-100 text-gray-800', label: 'Suspended' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredClients = clients.filter(client =>
    client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <SmartText tag="h1" className="text-3xl font-bold text-gray-900">Client Management</SmartText>
          <SmartText tag="p" className="text-gray-600">Manage your multi-client POS instances</SmartText>
        </div>
        <Button onClick={() => setShowAddClient(true)}>
          <Plus className="w-4 h-4 mr-2" />
          <SmartText>Add Client</SmartText>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <Card>
          <CardHeader>
            <CardTitle><SmartText>Add New Client</SmartText></CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name"><SmartText>Client Name *</SmartText></Label>
                  <Input
                    id="client_name"
                    value={newClient.client_name}
                    onChange={(e) => setNewClient({...newClient, client_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email"><SmartText>Contact Email *</SmartText></Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={newClient.contact_email}
                    onChange={(e) => setNewClient({...newClient, contact_email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone"><SmartText>Contact Phone</SmartText></Label>
                  <Input
                    id="contact_phone"
                    value={newClient.contact_phone}
                    onChange={(e) => setNewClient({...newClient, contact_phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company_name"><SmartText>Company Name</SmartText></Label>
                  <Input
                    id="company_name"
                    value={newClient.company_name}
                    onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="country"><SmartText>Country</SmartText></Label>
                  <Input
                    id="country"
                    value={newClient.country}
                    onChange={(e) => setNewClient({...newClient, country: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone"><SmartText>Timezone</SmartText></Label>
                  <Input
                    id="timezone"
                    value={newClient.timezone}
                    onChange={(e) => setNewClient({...newClient, timezone: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddClient(false)}>
                  <SmartText>Cancel</SmartText>
                </Button>
                <Button type="submit"><SmartText>Add Client</SmartText></Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{client.client_name}</CardTitle>
                {getStatusBadge(client.status)}
              </div>
              <div className="text-sm text-gray-600">{client.client_code}</div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{client.contact_email}</span>
                </div>
                
                {client.contact_phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{client.contact_phone}</span>
                  </div>
                )}
                
                {client.company_name && (
                  <div className="flex items-center text-sm">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{client.company_name}</span>
                  </div>
                )}
                
                {client.country && (
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{client.country}</span>
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Created: {formatDate(client.created_at)}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Activity className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Last seen: {formatDate(client.last_seen_at)}</span>
                </div>

                {client.license_key && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <SmartText tag="div" className="text-sm font-medium text-blue-900">License Info</SmartText>
                    <div className="text-xs text-blue-700">
                      Type: {client.license_key.license_type} | 
                      Status: {client.license_key.status}
                    </div>
                    {client.license_key.current_credits && (
                      <div className="text-xs text-blue-700">
                        Credits: {client.license_key.current_credits}/{client.license_key.max_credits}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedClient(client)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    <SmartText>View</SmartText>
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    <SmartText>Message</SmartText>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    <SmartText>Manage</SmartText>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <SmartText tag="h3" className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </SmartText>
            <SmartText tag="p" className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Get started by adding your first client instance'
              }
            </SmartText>
            {!searchTerm && (
              <Button onClick={() => setShowAddClient(true)}>
                <Plus className="w-4 h-4 mr-2" />
                <SmartText>Add First Client</SmartText>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle><SmartText>Client Details</SmartText></CardTitle>
                <Button variant="outline" onClick={() => setSelectedClient(null)}>
                  <SmartText>Close</SmartText>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview"><SmartText>Overview</SmartText></TabsTrigger>
                  <TabsTrigger value="license"><SmartText>License</SmartText></TabsTrigger>
                  <TabsTrigger value="usage"><SmartText>Usage Stats</SmartText></TabsTrigger>
                  <TabsTrigger value="activity"><SmartText>Activity</SmartText></TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label><SmartText>Client Name</SmartText></Label>
                      <div className="font-medium">{selectedClient.client_name}</div>
                    </div>
                    <div>
                      <Label><SmartText>Client Code</SmartText></Label>
                      <div className="font-medium">{selectedClient.client_code}</div>
                    </div>
                    <div>
                      <Label><SmartText>Status</SmartText></Label>
                      <div>{getStatusBadge(selectedClient.status)}</div>
                    </div>
                    <div>
                      <Label><SmartText>Contact Email</SmartText></Label>
                      <div className="font-medium">{selectedClient.contact_email}</div>
                    </div>
                    <div>
                      <Label><SmartText>Device Fingerprint</SmartText></Label>
                      <div className="font-mono text-xs">{selectedClient.device_fingerprint}</div>
                    </div>
                    <div>
                      <Label><SmartText>Created At</SmartText></Label>
                      <div>{formatDate(selectedClient.created_at)}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="license" className="space-y-4">
                  {selectedClient.license_key ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label><SmartText>License Type</SmartText></Label>
                          <div className="font-medium">{selectedClient.license_key.license_type}</div>
                        </div>
                        <div>
                          <Label><SmartText>Status</SmartText></Label>
                          <div>{getStatusBadge(selectedClient.license_key.status)}</div>
                        </div>
                        <div>
                          <Label><SmartText>Max Credits</SmartText></Label>
                          <div className="font-medium">{selectedClient.license_key.max_credits || 'N/A'}</div>
                        </div>
                        <div>
                          <Label><SmartText>Current Credits</SmartText></Label>
                          <div className="font-medium">{selectedClient.license_key.current_credits || 'N/A'}</div>
                        </div>
                      </div>
                      {selectedClient.license_key.features && (
                        <div>
                          <Label><SmartText>Features</SmartText></Label>
                          <div className="font-medium">{selectedClient.license_key.features}</div>
                        </div>
                      )}
                      {selectedClient.license_key.expires_at && (
                        <div>
                          <Label><SmartText>Expires At</SmartText></Label>
                          <div>{formatDate(selectedClient.license_key.expires_at)}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <SmartText tag="h3" className="text-lg font-semibold text-gray-900 mb-2">No License</SmartText>
                      <SmartText tag="p" className="text-gray-600">This client doesn't have an active license.</SmartText>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="usage" className="space-y-4">
                  {selectedClient.usage_stats && selectedClient.usage_stats.length > 0 ? (
                    <div className="space-y-2">
                      {selectedClient.usage_stats.slice(0, 10).map((stat) => (
                        <div key={stat.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{formatDate(stat.date)}</span>
                            <span className="text-sm text-gray-600">{stat.credits_consumed} credits used</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {stat.invoices_created} invoices, {stat.active_users} users, {stat.login_count} logins
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <SmartText tag="h3" className="text-lg font-semibold text-gray-900 mb-2">No Usage Data</SmartText>
                      <SmartText tag="p" className="text-gray-600">No usage statistics available for this client.</SmartText>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <SmartText tag="span" className="text-gray-600">First Seen:</SmartText>
                      <span>{formatDate(selectedClient.first_seen_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <SmartText tag="span" className="text-gray-600">Last Seen:</SmartText>
                      <span>{formatDate(selectedClient.last_seen_at)}</span>
                    </div>
                    {selectedClient.last_sync_at && (
                      <div className="flex justify-between">
                        <SmartText tag="span" className="text-gray-600">Last Sync:</SmartText>
                        <span>{formatDate(selectedClient.last_sync_at)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <SmartText tag="span" className="text-gray-600">Created:</SmartText>
                      <span>{formatDate(selectedClient.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <SmartText tag="span" className="text-gray-600">Updated:</SmartText>
                      <span>{formatDate(selectedClient.updated_at)}</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
