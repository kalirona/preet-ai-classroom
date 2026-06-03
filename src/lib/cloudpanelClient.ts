export interface CloudPanelStatus {
  configured: boolean;
  connected: boolean;
  usersCount: number;
  host?: string;
  database?: string;
  message: string;
}

/**
 * Checks with the backend to verify the connection status to the CloudPanel MySQL server.
 * All DB operations are run on the secure server side to fully isolate credentials and ensure safety.
 */
export async function getCloudPanelStatus(): Promise<CloudPanelStatus> {
  try {
    const res = await fetch("/api/cloudpanel/status");
    if (!res.ok) {
      throw new Error(`State network alert: HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      configured: false,
      connected: false,
      usersCount: 0,
      message: err.message || "Failed to reach CloudPanel status controller."
    };
  }
}
