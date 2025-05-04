
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserId } from '../services/api';
import { useLanguage } from '../components/LanguageProvider';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <img
          src="/public/lovable-uploads/c984b240-49e0-40ca-91a1-d9394eaba530.png"
          alt="Heimdall Logo"
          className="w-12 h-12"
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('welcome')}</h1>
          <p className="text-muted-foreground">{t('platformDescription')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('privileges')}</CardTitle>
            <CardDescription>Manage your privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View and manage your privilege requests</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/privileges')}>Go to Privileges</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('accessRequests')}</CardTitle>
            <CardDescription>Review and manage access requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Review and respond to access requests from other systems</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/access-requests')}>View Requests</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
            <CardDescription>Your client ID</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Logged in as:</p>
            <p className="font-mono">{currentUserId}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate('/login')}>Change Client ID</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
