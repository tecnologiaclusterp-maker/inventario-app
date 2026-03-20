import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useExportTickets() {
  return {
    exportCSV: async (company?: string) => {
      const url = new URL(api.reports.exportTickets.path, window.location.origin);
      if (company && company !== "__none__") {
        url.searchParams.append('company', company);
      }
      
      const res = await fetch(url.toString(), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error exportando tickets");
      
      const csv = await res.text();
      
      // Create blob and download
      const blob = new Blob([csv], { type: "text/csv" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `tickets-${company && company !== "__none__" ? company : 'all'}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    }
  };
}
