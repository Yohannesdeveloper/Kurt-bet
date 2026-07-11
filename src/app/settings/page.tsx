"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Palette, Bell, Shield, Printer, Settings, User, Mail, Briefcase, Hash } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  WAITER: "Waiter",
  KITCHEN: "Kitchen Staff",
  BARTENDER: "Bartender",
  BUTCHER: "Butcher",
  CLIENT: "Client",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const email = user?.email || "";
  const role = user?.role || "";
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || email?.[0]?.toUpperCase() || "?";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link
          href="/dashboard"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ethiopian-gold/20 to-ethiopian-clay/20 shadow-lg hover:from-ethiopian-gold/30 hover:to-ethiopian-clay/30 transition-all duration-200"
        >
          <ArrowLeft className="h-6 w-6 text-ethiopian-gold" />
        </Link>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 shadow-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-serif text-ethiopian-coffee dark:text-ethiopian-cream">Settings</h1>
          <p className="text-sm text-ethiopian-coffee/60 dark:text-ethiopian-cream/60">Manage your restaurant configuration</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-2 border-ethiopian-gold/10 dark:border-ethiopian-gold/20">
          <CardContent className="p-6">
            <Tabs defaultValue="profile">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Profile</TabsTrigger>
                <TabsTrigger value="general" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">General</TabsTrigger>
                <TabsTrigger value="appearance" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Appearance</TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Notifications</TabsTrigger>
                <TabsTrigger value="printing" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Printing</TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-serif text-ethiopian-coffee dark:text-ethiopian-cream">My Profile</CardTitle>
                    <CardDescription>Your account information from login</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-ethiopian-gold/30 to-ethiopian-clay/30 flex items-center justify-center shadow-lg">
                        {user?.image ? (
                          <img src={user.image} alt={firstName} className="h-20 w-20 rounded-2xl object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-ethiopian-coffee dark:text-ethiopian-cream">{initials}</span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-ethiopian-coffee dark:text-ethiopian-cream font-serif">{firstName} {lastName}</h2>
                        <p className="text-sm text-ethiopian-coffee/60 dark:text-ethiopian-cream/60">{roleLabels[role] || role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2 text-ethiopian-coffee dark:text-ethiopian-cream">
                          <User className="h-4 w-4 text-ethiopian-gold" /> First Name
                        </Label>
                        <Input defaultValue={firstName} readOnly className="h-11 bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2 text-ethiopian-coffee dark:text-ethiopian-cream">
                          <User className="h-4 w-4 text-ethiopian-gold" /> Last Name
                        </Label>
                        <Input defaultValue={lastName} readOnly className="h-11 bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2 text-ethiopian-coffee dark:text-ethiopian-cream">
                          <Mail className="h-4 w-4 text-ethiopian-gold" /> Email
                        </Label>
                        <Input defaultValue={email} readOnly className="h-11 bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2 text-ethiopian-coffee dark:text-ethiopian-cream">
                          <Briefcase className="h-4 w-4 text-ethiopian-gold" /> Role
                        </Label>
                        <Input defaultValue={roleLabels[role] || role} readOnly className="h-11 bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2 text-ethiopian-coffee dark:text-ethiopian-cream">
                          <Hash className="h-4 w-4 text-ethiopian-gold" /> User ID
                        </Label>
                        <Input defaultValue={user?.id || ""} readOnly className="h-11 bg-muted/50 font-mono text-xs" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="general" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Restaurant Information</CardTitle>
                    <CardDescription>Update your restaurant details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Restaurant Name</Label>
                        <Input defaultValue="My Restaurant" className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Email</Label>
                        <Input type="email" defaultValue="info@myrestaurant.com" className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Phone</Label>
                        <Input defaultValue="+1 555-0000" className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Currency</Label>
                        <Input defaultValue="USD" className="h-11" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label className="text-sm font-medium">Address</Label>
                        <Input defaultValue="123 Main Street, New York, NY 10001" className="h-11" />
                      </div>
                    </div>
                    <Button variant="premium" className="h-11">
                      <Save className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="mt-6">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Palette className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Appearance Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Theme and appearance settings will be available here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Bell className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Notification preferences will be available here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="printing" className="mt-6">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Printer className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Printing Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Printer configuration will be available here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Shield className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Security settings will be available here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
