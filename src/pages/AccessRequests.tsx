
import React, { useEffect, useState } from 'react';
import { PrivilegeRequest, PrivilegeState, PrivilegeUpdateRequest } from '../types/privileges';
import { fetchPrivileges, getCurrentUserId, updatePrivilegeState } from '../services/api';
import { Loader, Eye, AlertTriangle } from 'lucide-react';
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
import PrivilegeReadOnly from '../components/PrivilegeReadOnly';

import { Pencil } from "lucide-react";



import { Badge } from "@/components/ui/badge";


const AccessRequests: React.FC = () => {
  const [requests, setRequests] = useState<PrivilegeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [stateChangeConfirm, setStateChangeConfirm] = useState<{
    requestId: string;
    newState: PrivilegeState;
  } | null>(null);
  const currentUserId = getCurrentUserId();

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

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'APPROVED':
      case 'GRANTED':
        return <Badge className="bg-green-500">{state}</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
    }
  };


  const handleStateChange = async (requestId: string, newState: PrivilegeState, calleeClientId: string, callerClientId: string) => {
    // Open confirmation dialog instead of immediately changing state
    setStateChangeConfirm({ requestId, newState, calleeClientId, callerClientId });
  };
  
  const confirmStateChange = async () => {
    if (!stateChangeConfirm) return;
    
    const { requestId, newState, calleeClientId, callerClientId } = stateChangeConfirm;
    
    try {
      setUpdateLoading(requestId);
      const updateRequest: PrivilegeUpdateRequest = {
        id: requestId,
        state: newState,
        calleeClientId: calleeClientId,
        callerClientId: callerClientId
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
                    <TableHead>Callee</TableHead>
                    <TableHead>Caller</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.callerClientId}</TableCell>
                      <TableCell>{request.calleeClientId}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {request.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStateBadge(request.state)}
                          <Select
                            onValueChange={(value) =>
                              handleStateChange(
                                request.id!,
                                value as PrivilegeState,
                                request.calleeClientId,
                                request.callerClientId
                              )
                            }
                          >
                            <SelectTrigger className="w-8 h-8 p-0 border-none shadow-none hover:bg-muted">
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </SelectTrigger>
                            <SelectContent>
                              {request.state !== 'PENDING' && (
                                <SelectItem value="PENDING">PENDING</SelectItem>
                              )}
                              {request.state !== 'REJECTED' && (
                                <SelectItem value="REJECTED">REJECTED</SelectItem>
                              )}
                              {request.state !== 'GRANTED' && (
                                <SelectItem value="GRANTED">GRANTED</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
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
                            <PrivilegeReadOnly privilege={request} />
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
