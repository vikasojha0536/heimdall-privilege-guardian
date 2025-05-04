
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrivilegeRequest, PrivilegeRule, PrivilegeState, PrivilegeUpdateRequest } from '../types/privileges';
import { fetchPrivileges, getCurrentUserId, updatePrivilegeState } from '../services/api';
import { Loader, Eye, AlertTriangle, Edit } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import PrivilegeReadOnly from '../components/PrivilegeReadOnly';

const AccessRequests: React.FC = () => {
  const [requests, setRequests] = useState<PrivilegeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [stateChangeConfirm, setStateChangeConfirm] = useState<{
    requestId: string;
    newState: PrivilegeState;
    currentState: PrivilegeState;
  } | null>(null);
  const currentUserId = getCurrentUserId();
  const navigate = useNavigate();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchPrivileges(currentUserId, "callee");
      // Filter for requests where the current user is the callee
      const calleeRequests = Array.isArray(data) ? data.filter(
        (req: PrivilegeRequest) => req.calleeClientId === currentUserId
      ) : [];
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

  const handleStateChange = async (requestId: string, newState: PrivilegeState, currentState: PrivilegeState) => {
    // Check if the state transition is allowed
    if ((currentState === 'REJECTED' || currentState === 'GRANTED') && newState === 'PENDING') {
      toast.error('Cannot change state back to PENDING from REJECTED or GRANTED');
      return;
    }
    
    // Open confirmation dialog
    setStateChangeConfirm({ requestId, newState, currentState });
  };
  
  const confirmStateChange = async () => {
    if (!stateChangeConfirm) return;
    
    const { requestId, newState } = stateChangeConfirm;
    
    try {
      setUpdateLoading(requestId);
      const updateRequest: PrivilegeUpdateRequest = {
        id: requestId,
        state: newState,
      };
      
      await updatePrivilegeState(updateRequest);
      
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
      setStateChangeConfirm(null);
    }
  };

  const handleEdit = (requestId: string) => {
    navigate(`/privileges/edit/${requestId}`);
  };

  const renderStatusBadge = (state: PrivilegeState) => {
    switch (state) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'GRANTED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Granted</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
      default:
        return <Badge variant="outline">{state}</Badge>;
    }
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
                        <div className="flex items-center">
                          {renderStatusBadge(request.state)}
                          {request.state !== 'REJECTED' && request.state !== 'GRANTED' && (
                            <Select
                              value={request.state}
                              onValueChange={(value) => 
                                handleStateChange(request.id!, value as PrivilegeState, request.state)
                              }
                              disabled={updateLoading === request.id}
                            >
                              <SelectTrigger className="w-32 ml-2">
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
                                {request.state !== 'PENDING' && <SelectItem value="PENDING">PENDING</SelectItem>}
                                {request.state !== 'APPROVED' && <SelectItem value="APPROVED">APPROVED</SelectItem>}
                                {request.state !== 'REJECTED' && <SelectItem value="REJECTED">REJECTED</SelectItem>}
                                {request.state !== 'GRANTED' && <SelectItem value="GRANTED">GRANTED</SelectItem>}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-1">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{request.name}</DialogTitle>
                            </DialogHeader>
                            <PrivilegeReadOnly privilege={request} />
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(request.id!)}
                        >
                          <Edit className="h-4 w-4" />
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
      
      {/* Confirmation Dialog */}
      <AlertDialog 
        open={!!stateChangeConfirm} 
        onOpenChange={(open) => !open && setStateChangeConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Confirm Status Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status to <strong>{stateChangeConfirm?.newState}</strong>?
              {stateChangeConfirm?.newState === 'APPROVED' && (
                <p className="mt-2 text-green-600">This will grant access privileges to the caller.</p>
              )}
              {stateChangeConfirm?.newState === 'REJECTED' && (
                <p className="mt-2 text-red-600">This will deny access privileges to the caller.</p>
              )}
              {stateChangeConfirm?.newState === 'GRANTED' && (
                <p className="mt-2 text-green-600">This will grant access privileges to the caller.</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStateChange}
              className={stateChangeConfirm?.newState === 'APPROVED' || stateChangeConfirm?.newState === 'GRANTED' ? 
                'bg-green-600 hover:bg-green-700' : 
                stateChangeConfirm?.newState === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccessRequests;
