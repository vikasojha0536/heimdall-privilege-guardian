import React, { useEffect, useState } from "react";
import {
  PrivilegeRequest,
  PrivilegeRule,
  PrivilegeState,
  PrivilegeUpdateRequest,
  ResponseModeration,
} from "../types/privileges";
import {
  fetchPrivileges,
  getCurrentUserId,
  updatePrivilegeState,
} from "../services/api";
import { Loader, Eye, AlertTriangle, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import PrivilegeReadOnly from "../components/PrivilegeReadOnly";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const AccessRequests: React.FC = () => {
  const [requests, setRequests] = useState<PrivilegeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [stateChangeConfirm, setStateChangeConfirm] = useState<{
    requestId: string;
    newState: PrivilegeState;
    calleeClientId: string;
    callerClientId: string;
    privilegeRules: PrivilegeRule[];
  } | null>(null);
  const [responseModeration, setResponseModeration] =
    useState<ResponseModeration>({
      fields: "",
      responseFilterCriteria: "",
    });
  const [showResponseModeration, setShowResponseModeration] = useState(false);
  const [responseModerationContinue, setResponseModerationContinue] =
    useState(false);
  const currentUserId = getCurrentUserId();
  const { theme, setTheme } = useTheme();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchPrivileges(currentUserId, "callee");
      // Filter for requests where the current user is the callee
      const calleeRequests = Array.isArray(data)
        ? data.filter(
            (req: PrivilegeRequest) => req.calleeClientId === currentUserId
          )
        : [];
      setRequests(calleeRequests);
    } catch (error) {
      toast.error("Failed to load access requests");
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
      case "APPROVED":
      case "GRANTED":
        return <Badge className="bg-green-500">{state}</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "PENDING":
      default:
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Pending
          </Badge>
        );
    }
  };

  const handleStateChange = async (
    requestId: string,
    newState: PrivilegeState,
    calleeClientId: string,
    callerClientId: string,
    privilegeRules: PrivilegeRule[]
  ) => {
    // If we're granting or rejecting, show the response moderation dialog first
    if (newState === "REJECTED") {
      setShowResponseModeration(false);
      setStateChangeConfirm({
        requestId,
        newState,
        calleeClientId,
        callerClientId,
        privilegeRules,
      });
      setResponseModerationContinue(true);
    } else if (newState === "GRANTED") {
      setShowResponseModeration(true);
      console.log("requestId ==", requestId);
      setStateChangeConfirm({
        requestId,
        newState,
        calleeClientId,
        callerClientId,
        privilegeRules,
      });
    } else if (newState === "PENDING") {
      console.log("newState", newState);
      // For other states, go directly to confirmation
      setStateChangeConfirm({
        requestId,
        newState,
        calleeClientId,
        callerClientId,
        privilegeRules,
      });
      confirmStateChange();
    }
  };

  const confirmStateChange = async () => {
    if (!stateChangeConfirm) return;
    console.log("stateChangeConfirm = ", stateChangeConfirm);
    const {
      requestId,
      newState,
      calleeClientId,
      callerClientId,
      privilegeRules,
    } = stateChangeConfirm;

    try {
      setUpdateLoading(requestId);
      const updateRequest: PrivilegeUpdateRequest = {
        id: requestId,
        state: newState,
        calleeClientId: calleeClientId,
        callerClientId: callerClientId,
        privilegeRules: privilegeRules,
      };

      console.log("updateRequest", updateRequest);
      await updatePrivilegeState(updateRequest);

      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                state: newState,
                // Update response moderation if provided
                privilegeRules: req.privilegeRules.map((rule) => ({
                  ...rule,
                  responseModeration:
                    (newState === "GRANTED" || newState === "REJECTED") &&
                    showResponseModeration
                      ? responseModeration
                      : rule.responseModeration,
                })),
              }
            : req
        )
      );

      toast.success(`Request ${newState.toLowerCase()}`);
    } catch (error) {
      toast.error("Failed to update request status");
      console.error(error);
    } finally {
      setUpdateLoading(null);
      setStateChangeConfirm(null);
      setShowResponseModeration(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Requests</h1>
          <p className="text-muted-foreground">
            Review and manage privilege requests from other systems
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
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
              <p className="text-muted-foreground">
                No pending access requests
              </p>
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
                      <TableCell className="font-medium">
                        {request.name}
                      </TableCell>
                      <TableCell>{request.calleeClientId}</TableCell>
                      <TableCell>{request.callerClientId}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {request.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStateBadge(request.state)}
                          <Select
                              value={null}
                            onValueChange={(value) =>
                              handleStateChange(
                                request.id!,
                                value as PrivilegeState,
                                request.calleeClientId,
                                request.callerClientId,
                                request.privilegeRules
                              )
                            }
                          >
                            <SelectTrigger className="w-8 h-8 p-0 border-none shadow-none hover:bg-muted">
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </SelectTrigger>
                            <SelectContent>
                              {request.state !== "PENDING" && (
                                <SelectItem value="PENDING">PENDING</SelectItem>
                              )}
                              {request.state !== "REJECTED" && (
                                <SelectItem value="REJECTED">
                                  REJECTED
                                </SelectItem>
                              )}
                              {request.state !== "GRANTED" && (
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
                            <ScrollArea className="h-[60vh]">
                              <PrivilegeReadOnly privilege={request} />
                            </ScrollArea>
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

      {/* Response Moderation Dialog */}
      <Dialog
        open={
          showResponseModeration && stateChangeConfirm?.newState === "GRANTED"
        }
        onOpenChange={(open) => {
          if (!open) {
            setShowResponseModeration(false);
            setResponseModerationContinue(false);
          }
        }}
      >
        <DialogContent style={{ maxWidth: "70rem" }}>
          <DialogHeader>
            <DialogTitle>Response Moderation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 w-100 overflow-auto">
            <div style={{ maxHeight: "600px", overflow: "auto" }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Priority</TableHead>
                    <TableHead>Requested URL</TableHead>
                    <TableHead style={{ minWidth: "200px" }}>Scopes</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Response Fields</TableHead>
                    <TableHead className="text-right">
                      Response Filter Criteria
                    </TableHead>
                    <TableHead className="text-right">Metadata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stateChangeConfirm?.privilegeRules.map((elem, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {elem.priority}
                      </TableCell>
                      <TableCell>{elem.requestedURL}</TableCell>
                      <TableCell>
                        {Array.isArray(elem.scopes)
                          ? elem.scopes.join(", ")
                          : elem.scopes}
                      </TableCell>
                      <TableCell>{elem.requestedMethod}</TableCell>
                      <TableCell>
                        <Input
                          id="responsefields"
                          placeholder="Response Fields"
                          value={elem.responseModeration.fields || ""}
                          style={{ width: "12rem" }}
                          onChange={(e) => {
                            if (stateChangeConfirm) {
                              stateChangeConfirm.privilegeRules[
                                index
                              ].responseModeration.fields = e.target.value;
                              setStateChangeConfirm({
                                ...stateChangeConfirm,
                              });
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          style={{ width: "200px" }}
                          id="responseFilterCriteria"
                          placeholder="Response Filter Criteria"
                          value={elem.responseModeration.responseFilterCriteria || ""}
                          onChange={(e) => {
                            if (stateChangeConfirm) {
                              stateChangeConfirm.privilegeRules[
                                index
                              ].responseModeration.responseFilterCriteria =
                                e.target.value;
                              setStateChangeConfirm({
                                ...stateChangeConfirm,
                              });
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          style={{ width: "250px", minHeight: "80px" }}
                          id="metadata"
                          placeholder='{"key": "value"}'
                          value={JSON.stringify(elem.metaData || {}, null, 2)}
                          onChange={(e) => {
                            if (stateChangeConfirm) {
                              try {
                                const parsedMetadata = JSON.parse(e.target.value);
                                stateChangeConfirm.privilegeRules[index].metaData = parsedMetadata;
                                setStateChangeConfirm({
                                  ...stateChangeConfirm,
                                });
                              } catch (error) {
                                // Allow invalid JSON while typing
                                stateChangeConfirm.privilegeRules[index].metaData = {};
                              }
                            }
                          }}
                          className="font-mono text-sm"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResponseModeration(false);
                  setResponseModerationContinue(false);
                  setStateChangeConfirm(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowResponseModeration(false);
                  setResponseModerationContinue(true);
                  // Now show the confirmation dialog
                  if (stateChangeConfirm) {
                    // The state change confirm is already set, we just need to proceed
                  }
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={
          !!stateChangeConfirm &&
          !showResponseModeration &&
          responseModerationContinue
        }
        onOpenChange={(open) => !open && setStateChangeConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Confirm Status Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status to{" "}
              <strong>{stateChangeConfirm?.newState}</strong>?
              {stateChangeConfirm?.newState === "APPROVED" && (
                <p className="mt-2 text-green-600">
                  This will grant access privileges to the caller.
                </p>
              )}
              {stateChangeConfirm?.newState === "REJECTED" && (
                <p className="mt-2 text-red-600">
                  This will deny access privileges to the caller.
                </p>
              )}
              {stateChangeConfirm?.newState === "GRANTED" && (
                <p className="mt-2 text-green-600">
                  This will grant access privileges to the caller.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStateChange}
              className={
                stateChangeConfirm?.newState === "APPROVED" ||
                stateChangeConfirm?.newState === "GRANTED"
                  ? "bg-green-600 hover:bg-green-700"
                  : stateChangeConfirm?.newState === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
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
