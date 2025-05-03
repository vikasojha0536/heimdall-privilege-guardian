
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Loader, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  emptyPrivilegeRequest,
  emptyPrivilegeRule,
  PrivilegeRequest,
} from '../types/privileges';
import { createPrivilegeRequest, fetchPrivileges, getCurrentUserId } from '../services/api';
import { isEqual } from 'lodash';

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

// Form validation schema
const privilegeRuleSchema = z.object({
  _id: z.string().optional(),
  priority: z.number().min(0),
  requestedURL: z.string().url("Must be a valid URL"),
  scopes: z.array(z.string()),
  requestedMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  responseModeration: z.object({
    fields: z.string(),
    responseFilterCriteria: z.string(),
  }),
});

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  callerClientId: z.string().min(1, "Caller Client ID is required"),
  calleeClientId: z.string().min(1, "Callee Client ID is required"),
  skipUserTokenExpiry: z.boolean(),
  privilegeRules: z.array(privilegeRuleSchema).min(1, "At least one privilege rule is required"),
  state: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});

type FormValues = z.infer<typeof formSchema>;

const PrivilegeForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [originalFormValues, setOriginalFormValues] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyPrivilegeRequest,
  });

  // Setup field array for privilege rules
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "privilegeRules",
  });

  // Load privilege data if editing
  useEffect(() => {
    async function loadPrivilege() {
      if (id) {
        try {
          setLoading(true);
          const data = await fetchPrivileges();
          const privilege = data.find((p: PrivilegeRequest) => p.id === id);
          
          if (privilege) {
            // Set form values
            form.reset(privilege);
            setOriginalFormValues(privilege as FormValues);
          } else {
            toast.error("Privilege not found");
            navigate('/privileges');
          }
        } catch (error) {
          toast.error("Failed to load privilege data");
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        // Set caller ID automatically for new requests
        form.setValue('callerClientId', getCurrentUserId());
      }
    }

    loadPrivilege();
  }, [id, navigate, form]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      
      const result = await createPrivilegeRequest(values);
      
      toast.success(id ? "Privilege updated successfully" : "Privilege created successfully");
      navigate('/privileges');
    } catch (error) {
      toast.error("Failed to save privilege");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Check if form has been modified (for the submit button enable/disable)
  const hasFormChanged = () => {
    if (!originalFormValues) return true; // New form, always allow submit
    
    const currentValues = form.getValues();
    return !isEqual(currentValues, originalFormValues);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start">
        <Button
          variant="ghost"
          onClick={() => navigate('/privileges')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {id ? "Edit Privilege Request" : "New Privilege Request"}
          </h1>
          <p className="text-muted-foreground">
            {id
              ? "Update your existing privilege request"
              : "Create a new privilege request to another system"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a name for this privilege" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this privilege request
                      </FormDescription>
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
                          placeholder="Describe the purpose of this privilege request"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about why this privilege is needed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="callerClientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caller Client ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your client ID"
                            {...field}
                            disabled={!id ? true : false}
                          />
                        </FormControl>
                        <FormDescription>Your system's identifier</FormDescription>
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
                          <Input placeholder="Target system client ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          The system you're requesting privilege from
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="skipUserTokenExpiry"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Skip User Token Expiry</FormLabel>
                        <FormDescription>
                          Allow access even when user tokens have expired
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Privilege Rules</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ ...emptyPrivilegeRule })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No rules added yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => append({ ...emptyPrivilegeRule })}
                    >
                      Add your first rule
                    </Button>
                  </div>
                ) : (
                  fields.map((field, index) => (
                    <div key={field.id} className="space-y-4 rounded-lg border p-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Rule {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`privilegeRules.${index}.priority`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`privilegeRules.${index}.requestedMethod`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>HTTP Method</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {httpMethods.map((method) => (
                                    <SelectItem key={method} value={method}>
                                      {method}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`privilegeRules.${index}.requestedURL`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Requested URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/api" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-4">
                        <h5 className="font-medium text-sm">Response Moderation</h5>
                        <FormField
                          control={form.control}
                          name={`privilegeRules.${index}.responseModeration.fields`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fields</FormLabel>
                              <FormControl>
                                <Input placeholder="Fields to include/exclude" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`privilegeRules.${index}.responseModeration.responseFilterCriteria`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Response Filter Criteria</FormLabel>
                              <FormControl>
                                <Input placeholder="Filter criteria" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/privileges')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || (!!id && !hasFormChanged())}
              >
                {submitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {id ? 'Update Request' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default PrivilegeForm;
