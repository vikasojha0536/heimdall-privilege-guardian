
import React from 'react';
import { Link } from 'react-router-dom';
import { Key, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { environment } from '../config/environment';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Heimdall</h1>
        <p className="text-muted-foreground">
          The guardian of privilege requests between callers and callees
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <Key className="mr-2 h-5 w-5 text-primary" />
              My Privileges
            </CardTitle>
            <CardDescription>
              View and manage privileges you have requested from other systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Create, edit, and track the status of your privilege requests to other callees.
            </p>
            <Button asChild>
              <Link to="/privileges" className="w-full sm:w-auto">
                Go to My Privileges
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <Shield className="mr-2 h-5 w-5 text-accent" />
              Access Requests
            </CardTitle>
            <CardDescription>
              Review and manage access requests from other systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Approve or reject privilege requests from other callers to your system.
            </p>
            <Button asChild variant="outline">
              <Link to="/requests" className="w-full sm:w-auto">
                Go to Access Requests
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Environment:</span>
              <span className="text-sm font-medium">
                {environment.production ? 'Production' : 'Development'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Authentication:</span>
              <span className="text-sm font-medium">
                {environment.useAuth ? 'Microsoft Azure SSO' : 'Bypassed for Development'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">API Endpoint:</span>
              <span className="text-sm font-medium truncate max-w-[250px]">
                {environment.baseUrl}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
