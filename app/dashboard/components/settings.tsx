"use client";
// Route /settings/security exists — handled via tabs inside /dashboard/settings
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import {
  accountSettingFormSchema,
  profileSettingsFormSchema,
} from "@/lib/formSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { redirect } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
// import { update2fa, updateAccountInfo, updateProfile } from "../action";

type DashboardProps = {
  user: any;
};

export default function Settings({ user }: DashboardProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      redirect("/auth/sign-in");
    }
  }, [user]);

  const profileForm = useForm<z.infer<typeof profileSettingsFormSchema>>({
    resolver: zodResolver(profileSettingsFormSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      address: user?.address ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      dateOfBirth: user?.dateOfBirth
        ? (new Date(user.dateOfBirth ?? "").toISOString().split("T")[0] as any)
        : null,
      profilePicture: undefined,
    },
  });
  const accountForm = useForm<z.infer<typeof accountSettingFormSchema>>({
    resolver: zodResolver(accountSettingFormSchema),
    mode: "onBlur",
    defaultValues: {
      email: user?.email ?? "",
      newPassword: "",
      password: "",
    },
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [loading2fa, setLoading2fa] = useState(false);

  const handleProfileSubmit = async () => {
    setLoadingProfile(true);

    // try {
    // 	const result = await updateProfile(user.id, profileForm.getValues());

    // 	if (result.success) {
    // 		// redirect to the next page
    // 		localStorage.setItem('user', JSON.stringify(result.user))
    //     toast({
    //       title: result.message,
    //       description: result.message,
    //       variant: "success"
    //     })
    //     setLoadingProfile(false);
    // 		return;
    // 	}
    // 	throw new Error(result.message);
    // } catch (err: any) {
    // 	console.error(err.message);
    // 	toast({
    // 		title: err.message,
    // 		description: err.message,
    // 		variant: "destructive"
    // 	})
    // 	setLoadingProfile(false);
    // }
  };

  const handleAccountSubmit = async () => {
    setLoadingAccount(true);

    // try {
    // 	const result = await updateAccountInfo(user.id, accountForm.getValues());

    // 	if (result.success) {
    // 		// redirect to the next page
    // 		localStorage.setItem('user', JSON.stringify(result.user))
    //     toast({
    //       title: result.message,
    //       description: result.message,
    //       variant: "success"
    //     })
    //     setLoadingAccount(false);
    // 	} else {
    //     throw new Error(result.message);
    //   }
    // } catch (err: any) {
    // 	console.error(err.message);
    // 	toast({
    // 		title: err.message,
    // 		description: err.message,
    // 		variant: "destructive"
    // 	})
    // 	setLoadingAccount(false);
    // }

    // remove the value of password and new password
    accountForm.setValue("password", "");
    accountForm.setValue("newPassword", "");
  };

  const profilePictureRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const handle2StepVerification = async (checked: boolean) => {
    setLoading2fa(true);

    // try {
    //   const result = await update2fa(user.id, checked);

    // 	if (result.success) {
    // 		// redirect to the next page
    // 		localStorage.setItem('user', JSON.stringify(result.user))
    //     user.twoStepAuthEnabled = checked;
    //     toast({
    //       title: result.message,
    //       description: result.message,
    //       variant: "success"
    //     })
    //     setLoadingAccount(false);
    // 	} else {
    //     throw new Error(result.message);
    //   }
    // } catch (err: any) {
    //   console.error(err.message);
    //   toast({
    //     title: err.message,
    //     description: err.message,
    //     variant: "destructive",
    //   });
    // }

    setLoading2fa(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
      <div className="md:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center mx-5">
                    <div className="mb-3 flex h-12 w-12 lg:h-20 lg:w-20 items-center justify-center rounded-full bg-blue-500">
                      <span className="text-xl lg:text-3xl font-bold text-white">
                        JD
                      </span>
                    </div>
                    <Button
                      type="button"
                      className="text-xs w-full"
                      variant="outline"
                      disabled={loadingProfile}
                      onClick={() => profilePictureRef.current?.click()}
                    >
                      Change
                    </Button>
                    <div className="hidden">
                      <FormField
                        control={profileForm.control}
                        name="profilePicture"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                ref={profilePictureRef}
                                type="file"
                                placeholder="Change"
                                className="text-xs"
                                value={undefined}
                                disabled={loadingProfile}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 w-full mt-4">
                    {/* Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="First Name"
                                disabled={loadingProfile}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Last Name"
                                disabled={loadingProfile}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-1">
                      <FormField
                        control={profileForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Date of Birth"
                                disabled={loadingProfile}
                                type="date"
                                // onChange={event => field.onChange(+event.target.value)}
                                value={
                                  field.value instanceof Date
                                    ? field.value.toISOString().split("T")[0]
                                    : field.value
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      ></FormField>
                      <FormField
                        control={profileForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Phone Number"
                                disabled={loadingProfile}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={profileForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Address"
                              disabled={loadingProfile}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="bg-blue-500 self-end px-8"
                      disabled={loadingProfile}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-3 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...accountForm}>
              <form onSubmit={accountForm.handleSubmit(handleAccountSubmit)}>
                <div className="flex flex-col gap-2">
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Email Address"
                            type="email"
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Password"
                            type="password"
                            disabled={loadingAccount}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="New Password"
                            type="password"
                            disabled={loadingAccount}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="bg-blue-500 self-end px-8 mt-6"
                    disabled={loadingAccount}
                  >
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <Label>2 Step Verification</Label>
              <Switch
                id="2-step-verification"
                onCheckedChange={handle2StepVerification}
                checked={user.twoStepAuthEnabled}
                disabled={loading2fa}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
