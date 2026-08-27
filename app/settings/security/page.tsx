"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, AlertTriangle, LogOut, Globe } from "lucide-react";

interface SessionData {
  id: string;
  token: string;
  userAgent: string | null;
  ipAddress: string | null;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
}

interface LockoutData {
  lockedUntil: string | null;
  loginAttempts: number;
  isLocked: boolean;
}

interface PasswordEntry {
  id: string;
  createdAt: string;
}

export default function SecurityPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [lockout, setLockout] = useState<LockoutData | null>(null);
  const [passwordHistory, setPasswordHistory] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/auth/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
        setLockout(data.lockout);
        setPasswordHistory(data.passwordHistory);
      }
    } catch (err) {
      console.error("Failed to fetch security data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTerminate = async (sessionId: string) => {
    const res = await fetch("/api/auth/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "terminate", sessionId }),
    });
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  const handleTerminateOthers = async () => {
    const currentToken = sessions[0]?.token;
    const res = await fetch("/api/auth/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "terminateOthers",
        currentSessionToken: currentToken,
      }),
    });
    if (res.ok) {
      setSessions([]);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading security settings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
        <p className="text-gray-500">
          Manage your account security, active sessions, and password history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Account Lockout Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lockout?.isLocked ? (
            <div className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              <span>
                Your account is locked until{" "}
                {new Date(lockout.lockedUntil!).toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="h-5 w-5" />
              <span>
                Account is active. Failed login attempts:{" "}
                {lockout?.loginAttempts ?? 0} / 5
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Active Sessions ({sessions.length})
          </CardTitle>
          {sessions.length > 1 && (
            <Button variant="destructive" size="sm" onClick={handleTerminateOthers}>
              Terminate All Other Sessions
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground">No active sessions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {s.userAgent || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell>{s.ipAddress || "Unknown"}</TableCell>
                    <TableCell>
                      {new Date(s.lastActiveAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminate(s.id)}
                      >
                        Terminate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password History (Last 5)</CardTitle>
        </CardHeader>
        <CardContent>
          {passwordHistory.length === 0 ? (
            <p className="text-muted-foreground">
              No password changes recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Changed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passwordHistory.map((entry, idx) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {idx === 0 ? "Current" : `${passwordHistory.length - idx} changes ago`}
                    </TableCell>
                    <TableCell>
                      {new Date(entry.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
