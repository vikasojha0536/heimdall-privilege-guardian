
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrivilegeRequest } from '../types/privileges';
import { fetchPrivileges, getCurrentUserId } from '../services/api';
import { PlusCircle, Pencil, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const MyPrivileges: React.FC = () => {
  const [privileges, setPrivileges] = useState<PrivilegeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  const loadPrivileges = async () => {
    try {
      setLoading(true);
      const data = await fetchPrivileges();
      // Filter for privileges where the current user is the caller
      const userPrivileges = data.filter(
        (privilege: PrivilegeRequest) => privilege.callerClientId === currentUserId
      );
      setPrivileges(userPrivileges);
    } catch (error) {
      toast.error('Failed to load privileges');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrivileges();
  }, []);

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'APPROVED':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Privileges</h1>
          <p className="text-muted-foreground">
            View and manage privilege requests you've made to other systems
          </p>
        </div>
        <Button onClick={() => navigate('/privileges/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Privilege Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : privileges.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No privilege requests found</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/privileges/new')}>
                Create your first request
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Callee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {privileges.map((privilege) => (
                    <TableRow key={privilege.id}>
                      <TableCell className="font-medium">{privilege.name}</TableCell>
                      <TableCell>{privilege.calleeClientId}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {privilege.description}
                      </TableCell>
                      <TableCell>{getStateBadge(privilege.state)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/privileges/edit/${privilege.calleeClientId}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyPrivileges;
