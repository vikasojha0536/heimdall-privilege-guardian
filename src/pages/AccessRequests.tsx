
import React, { useEffect, useState } from 'react';
import { PrivilegeRequest, PrivilegeState, PrivilegeUpdateRequest } from '../types/privileges';
import { fetchPrivileges, getCurrentUserId, updatePrivilegeRequest } from '../services/api';
import { Loader, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const AccessRequests: React.FC = () => {
  const [requests, setRequests] = useState<PrivilegeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const currentUserId = getCurrentUserId();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchPrivileges();
      // Filter for requests where the current user is the callee
      const calleeRequests = data.filter(
        (req: PrivilegeRequest) => req.calleeClientId === currentUserId
      );
      setRequests(calleeRequests);
    } catch (error) {
      toast.error('Failed to load access requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStateChange = async (requestId: string, newState: PrivilegeState) => {
    try {
      setUpdateLoading(requestId);
      const updateRequest: PrivilegeUpdateRequest = {
        id: requestId,
        state: newState,
      };
      
      await updatePrivilegeRequest(updateRequest);
      
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, state: newState } : req
        )
      );
      
      toast.success(`Request ${newState.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update request status');
      console.error(error);
    } finally {
      setUpdateLoading(null);
    }
  };

  const RequestDetails: React.FC<{ request: PrivilegeRequest }> = ({ request }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Request Details</h4>
          <div className="rounded-md bg-secondary p-4">
            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[400px]">
              {JSON.stringify(request, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Access Requests</h1>
        <p className="text-muted-foreground">
          Review and manage privilege requests from other systems
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Review</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending access requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Caller</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.callerClientId}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {request.description}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={request.state}
                          onValueChange={(value) => 
                            handleStateChange(request.id!, value as PrivilegeState)
                          }
                          disabled={updateLoading === request.id}
                        >
                          <SelectTrigger className="w-32">
                            {updateLoading === request.id ? (
                              <div className="flex items-center">
                                <Loader className="h-3 w-3 animate-spin mr-2" />
                                <SelectValue />
                              </div>
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{request.name}</DialogTitle>
                            </DialogHeader>
                            <RequestDetails request={request} />
                          </DialogContent>
                        </Dialog>
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

export default AccessRequests;
