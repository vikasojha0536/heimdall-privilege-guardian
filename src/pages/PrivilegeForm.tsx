
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Plus, Trash } from 'lucide-react';
import { createPrivilegeRequest, getPrivilegeRequest } from '@/lib/api';
import { PrivilegeRequest, PrivilegeRule, emptyPrivilegeRule } from '@/types/privileges';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Privilege name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  callerClientId: z.string().min(2, {
    message: "Caller Client ID must be at least 2 characters.",
  }),
  calleeClientId: z.string().min(2, {
    message: "Callee Client ID must be at least 2 characters.",
  }),
  skipUserTokenExpiry: z.boolean().default(false),
  privilegeRules: z.array(
    z.object({
      _id: z.string().optional(),
      priority: z.number().default(0),
      requestedURL: z.string().min(2, {
        message: "Requested URL must be at least 2 characters.",
      }),
      scopes: z.array(z.string()).default([]),
      requestedMethod: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET"),
      responseModeration: z.object({
        fields: z.string().optional(),
        responseFilterCriteria: z.string().optional()
      }).optional()
    })
  ).default([])
})

const PrivilegeForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempRule, setTempRule] = useState<Partial<PrivilegeRule>>({
    priority: 0,
    requestedURL: '',
    scopes: [],
    requestedMethod: 'GET',
    responseModeration: {
      fields: '',
      responseFilterCriteria: ''
    }
  });
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<PrivilegeRequest | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      callerClientId: "",
      calleeClientId: "",
      skipUserTokenExpiry: false,
      privilegeRules: [],
    },
    mode: "onChange"
  });

  useEffect(() => {
    if (id) {
      const fetchPrivilege = async () => {
        try {
          const privilege = await getPrivilegeRequest(id);
          if (privilege) {
            setInitialValues(privilege);
            form.reset(privilege);
          } else {
            toast.error("Privilege not found");
            navigate('/privileges');
          }
        } catch (error) {
          console.error("Error fetching privilege:", error);
          toast.error("Failed to fetch privilege");
          navigate('/privileges');
        }
      };
      fetchPrivilege();
    }
  }, [id, navigate, form]);

  const handleSubmit = async (formData: z.infer<typeof formSchema>) => {
    try {
      setSubmitting(true);
      
      // Always set state to PENDING for new privilege requests
      const privilegeRequest: PrivilegeRequest = {
        name: formData.name,
        description: formData.description,
        callerClientId: formData.callerClientId,
        calleeClientId: formData.calleeClientId,
        skipUserTokenExpiry: formData.skipUserTokenExpiry,
        privilegeRules: formData.privilegeRules.map(rule => ({
          _id: rule._id || "",
          priority: rule.priority || 0,
          requestedURL: rule.requestedURL || "",
          scopes: rule.scopes || [],
          requestedMethod: rule.requestedMethod || "GET",
          responseModeration: {
            fields: rule.responseModeration?.fields || "",
            responseFilterCriteria: rule.responseModeration?.responseFilterCriteria || ""
          }
        })),
        state: 'PENDING' // Always set to PENDING when creating/editing
      };
      
      // If there's an ID, include it in the request
      if (id) {
        privilegeRequest.id = id;
      }
      
      const result = await createPrivilegeRequest(privilegeRequest);
      
      toast.success(id ? "Privilege updated successfully" : "Privilege created successfully");
      navigate('/privileges');
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit privilege request");
    } finally {
      setSubmitting(false);
    }
  };

  const isAddRuleEnabled = () => {
    return Boolean(
      tempRule.requestedURL && 
      tempRule.requestedURL.length >= 2 && 
      tempRule.requestedMethod
    );
  };

  const handleAddRule = () => {
    if (!isAddRuleEnabled()) {
      toast.error("Please fill in all required fields for the rule");
      return;
    }

    const newRule: PrivilegeRule = {
      _id: "",
      priority: tempRule.priority || 0,
      requestedURL: tempRule.requestedURL || "",
      scopes: Array.isArray(tempRule.scopes) ? tempRule.scopes : 
        (tempRule.scopes as unknown as string)?.split(',').filter(Boolean) || [],
      requestedMethod: tempRule.requestedMethod || "GET",
      responseModeration: {
        fields: tempRule.responseModeration?.fields || "",
        responseFilterCriteria: tempRule.responseModeration?.responseFilterCriteria || ""
      }
    };
    
    const currentRules = form.getValues("privilegeRules") || [];
    form.setValue('privilegeRules', [...currentRules, newRule]);
    
    // Reset the temp rule
    setTempRule({
      priority: 0,
      requestedURL: '',
      scopes: [],
      requestedMethod: 'GET',
      responseModeration: {
        fields: '',
        responseFilterCriteria: ''
      }
    });
    
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{id ? "Edit Privilege" : "Create Privilege"}</CardTitle>
        <CardDescription>
          {id
            ? "Edit the privilege details below."
            : "Create a new privilege by entering the details below."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privilege Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Privilege Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Privilege Description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="callerClientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caller Client ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Caller Client ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="calleeClientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Callee Client ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Callee Client ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="skipUserTokenExpiry"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel>Skip User Token Expiry</FormLabel>
                    <FormDescription>
                      Check this if you want to skip user token expiry.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Privilege Rules</FormLabel>
              <FormDescription>
                Add or modify privilege rules for this privilege.
              </FormDescription>
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
                  {form.watch("privilegeRules")?.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rule.priority}</TableCell>
                      <TableCell>{rule.requestedURL}</TableCell>
                      <TableCell>{Array.isArray(rule.scopes) ? rule.scopes.join(', ') : rule.scopes}</TableCell>
                      <TableCell>{rule.requestedMethod}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newRules = [...form.getValues("privilegeRules")];
                            newRules.splice(index, 1);
                            form.setValue('privilegeRules', newRules);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5} className="text-right">
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Rule
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Add Privilege Rule</DialogTitle>
                            <DialogDescription>
                              Add a new privilege rule to the privilege.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-2">
                              <Label htmlFor="priority">Priority</Label>
                              <Input 
                                id="priority" 
                                type="number" 
                                placeholder="Priority" 
                                value={tempRule.priority || 0}
                                onChange={(e) => setTempRule({
                                  ...tempRule,
                                  priority: parseInt(e.target.value)
                                })}
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <Label htmlFor="requestedURL">Requested URL</Label>
                              <Input 
                                id="requestedURL" 
                                placeholder="Requested URL" 
                                value={tempRule.requestedURL || ''}
                                onChange={(e) => setTempRule({
                                  ...tempRule,
                                  requestedURL: e.target.value
                                })}
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <Label htmlFor="scopes">Scopes</Label>
                              <Input 
                                id="scopes" 
                                placeholder="Scopes (comma separated)" 
                                value={Array.isArray(tempRule.scopes) ? tempRule.scopes.join(',') : tempRule.scopes || ''}
                                onChange={(e) => setTempRule({
                                  ...tempRule,
                                  scopes: e.target.value.split(',').filter(Boolean)
                                })}
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <Label htmlFor="requestedMethod">Requested Method</Label>
                              <Select 
                                onValueChange={(value) => setTempRule({
                                  ...tempRule, 
                                  requestedMethod: value as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
                                })}
                                value={tempRule.requestedMethod}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="GET">GET</SelectItem>
                                  <SelectItem value="POST">POST</SelectItem>
                                  <SelectItem value="PUT">PUT</SelectItem>
                                  <SelectItem value="DELETE">DELETE</SelectItem>
                                  <SelectItem value="PATCH">PATCH</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button 
                              type="button" 
                              onClick={handleAddRule}
                              disabled={!isAddRuleEnabled()}
                            >
                              Add Rule
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PrivilegeForm;
