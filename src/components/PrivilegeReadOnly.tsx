import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PrivilegeRequest } from "../types/privileges";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PrivilegeReadOnlyProps {
  privilege: PrivilegeRequest;
}

const PrivilegeReadOnly: React.FC<PrivilegeReadOnlyProps> = ({ privilege }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="read-name">Privilege Name</Label>
          <Input
            id="read-name"
            value={privilege.name}
            readOnly
            className="bg-gray-100 dark:bg-gray-800"
          />
        </div>
        <div>
          <Label htmlFor="read-description">Description</Label>
          <Textarea
            id="read-description"
            value={privilege.description}
            readOnly
            className="resize-none bg-gray-100 dark:bg-gray-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="read-caller">Caller Client ID</Label>
          <Input
            id="read-caller"
            value={privilege.callerClientId}
            readOnly
            className="bg-gray-100 dark:bg-gray-800"
          />
        </div>
        <div>
          <Label htmlFor="read-callee">Callee Client ID</Label>
          <Input
            id="read-callee"
            value={privilege.calleeClientId}
            readOnly
            className="bg-gray-100 dark:bg-gray-800"
          />
        </div>
      </div>

      <div>
        <Label>Privilege Rules</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Rules defined for this privilege.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Priority</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Requested URL</TableHead>
              <TableHead>Scopes</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>Response Filter Criteria</TableHead>
              <TableHead>SkipUserTokenValidation</TableHead>
              <TableHead>SkipUserTokenExpiryValidation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {privilege.privilegeRules?.map((rule, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{rule.priority}</TableCell>
                <TableCell>{rule.description || "-"}</TableCell>
                <TableCell>{rule.requestedURL}</TableCell>
                <TableCell>
                  {Array.isArray(rule.scopes)
                    ? rule.scopes.join(", ")
                    : rule.scopes || "-"}
                </TableCell>
                <TableCell>{rule.requestedMethod}</TableCell>
                <TableCell>{rule.responseModeration.fields}</TableCell>
                <TableCell>
                  {rule.responseModeration.responseFilterCriteria}
                </TableCell>
                <TableCell>
                  <Checkbox checked={rule.disableAccessTokenValidation} disabled />
                </TableCell>
                <TableCell>
                  <Checkbox checked={rule.disableAccessTokenExpiryValidation} disabled />
                </TableCell>
              </TableRow>
            ))}
            {(!privilege.privilegeRules ||
              privilege.privilegeRules.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-4 text-muted-foreground"
                >
                  No rules defined
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Label>State</Label>
        <Input
          value={privilege.state}
          readOnly
          className="bg-gray-100 dark:bg-gray-800 w-32"
        />
      </div>
    </div>
  );
};

export default PrivilegeReadOnly;
