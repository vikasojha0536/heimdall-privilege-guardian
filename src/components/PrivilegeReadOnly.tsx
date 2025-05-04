
import React, { useState } from 'react';
import { PrivilegeRequest, PrivilegeRule } from '../types/privileges';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrivilegeReadOnlyProps {
  privilege: PrivilegeRequest;
}

const PrivilegeReadOnly: React.FC<PrivilegeReadOnlyProps> = ({ privilege }) => {
  const [selectedRule, setSelectedRule] = useState<PrivilegeRule | null>(null);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);

  const renderStatusBadge = (state: string) => {
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

  const viewRuleDetail = (rule: PrivilegeRule) => {
    setSelectedRule(rule);
    setIsRuleDialogOpen(true);
  };

  return (
    <ScrollArea className="h-[60vh]">
      <div className="space-y-6 p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Privilege Name</Label>
            <div className="font-medium mt-1">{privilege.name}</div>
          </div>
          <div>
            <Label className="text-muted-foreground">Status</Label>
            <div className="font-medium mt-1">{renderStatusBadge(privilege.state)}</div>
          </div>
        </div>

        <div>
          <Label className="text-muted-foreground">Description</Label>
          <div className="font-medium mt-1">{privilege.description}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Caller Client ID</Label>
            <div className="font-medium mt-1">{privilege.callerClientId}</div>
          </div>
          <div>
            <Label className="text-muted-foreground">Callee Client ID</Label>
            <div className="font-medium mt-1">{privilege.calleeClientId}</div>
          </div>
        </div>

        <div>
          <Label className="text-muted-foreground">Skip User Token Expiry</Label>
          <div className="font-medium mt-1">{privilege.skipUserTokenExpiry ? 'Yes' : 'No'}</div>
        </div>

        <div>
          <Label className="text-muted-foreground">Privilege Rules</Label>
          <div className="mt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Priority</TableHead>
                  <TableHead>Requested URL</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {privilege.privilegeRules?.map((rule, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{rule.priority}</TableCell>
                    <TableCell>{rule.requestedURL}</TableCell>
                    <TableCell>{Array.isArray(rule.scopes) ? rule.scopes.join(', ') : rule.scopes}</TableCell>
                    <TableCell>{rule.requestedMethod}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewRuleDetail(rule)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Additional metadata if available */}
        {(privilege.createdAt || privilege.updatedAt) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            {privilege.createdAt && (
              <div>
                <Label className="text-muted-foreground">Created At</Label>
                <div>{new Date(privilege.createdAt).toLocaleString()}</div>
              </div>
            )}
            {privilege.updatedAt && (
              <div>
                <Label className="text-muted-foreground">Updated At</Label>
                <div>{new Date(privilege.updatedAt).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        {/* Rule Detail Dialog */}
        <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Privilege Rule Details</DialogTitle>
            </DialogHeader>
            {selectedRule && (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <div className="font-medium">{selectedRule.priority}</div>
                </div>

                {selectedRule.description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <div className="font-medium">{selectedRule.description}</div>
                  </div>
                )}

                <div>
                  <Label className="text-muted-foreground">Requested URL</Label>
                  <div className="font-medium">{selectedRule.requestedURL}</div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Requested Method</Label>
                  <div className="font-medium">{selectedRule.requestedMethod}</div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Scopes</Label>
                  <div className="font-medium">
                    {Array.isArray(selectedRule.scopes) && selectedRule.scopes.length > 0
                      ? selectedRule.scopes.join(', ')
                      : 'None'}
                  </div>
                </div>

                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">Response Moderation</h4>
                  <div>
                    <Label className="text-muted-foreground">Fields</Label>
                    <div className="font-medium">{selectedRule.responseModeration?.fields || 'None'}</div>
                  </div>
                  <div className="mt-2">
                    <Label className="text-muted-foreground">Response Filter Criteria</Label>
                    <div className="font-medium">{selectedRule.responseModeration?.responseFilterCriteria || 'None'}</div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ScrollArea>
  );
};

export default PrivilegeReadOnly;
