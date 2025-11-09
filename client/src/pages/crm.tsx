import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, Column } from "@/components/data-table";
import { CRMTableFilters } from "@/components/crm-table-filters";
import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { useQuery } from "@tanstack/react-query";
import type { Lead as LeadType, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

type DisplayLead = {
  id: string;
  name: string;
  company: string;
  email: string;
  stage: "lead" | "negotiation" | "closed";
  assignedTo: string;
  lastContact: string;
};

export default function CRM() {
  const [selectedTab, setSelectedTab] = useState("leads");
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);

  const { data: leads, isLoading: leadsLoading } = useQuery<LeadType[]>({
    queryKey: ["/api/leads"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const getUserName = (userId: string | null) => {
    if (!userId || !users) return "Unassigned";
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown" : "Unknown";
  };

  const displayLeads: DisplayLead[] = leads?.map(lead => ({
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    stage: lead.stage,
    assignedTo: getUserName(lead.assignedTo),
    lastContact: lead.lastContact 
      ? formatDistanceToNow(new Date(lead.lastContact), { addSuffix: true })
      : "Never",
  })) || [];

  const leadColumns: Column<DisplayLead>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Company", accessorKey: "company" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Stage",
      accessorKey: "stage",
      cell: (value) => <StatusBadge status={value} />,
    },
    {
      header: "Assigned To",
      accessorKey: "assignedTo",
      cell: (value) => (
        <div className="flex items-center gap-2">
          <UserAvatar name={value} className="h-6 w-6" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    { header: "Last Contact", accessorKey: "lastContact" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">CRM</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your leads, clients, deals, and contacts</p>
      </div>

      <LeadFormDialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen} />

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="leads" data-testid="tab-leads">Leads</TabsTrigger>
          <TabsTrigger value="clients" data-testid="tab-clients">Clients</TabsTrigger>
          <TabsTrigger value="deals" data-testid="tab-deals">Deals</TabsTrigger>
          <TabsTrigger value="contacts" data-testid="tab-contacts">Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4 mt-6">
          <CRMTableFilters
            placeholder="Search leads..."
            addLabel="Add Lead"
            onSearch={(q) => console.log("Search:", q)}
            onFilterStage={(s) => console.log("Filter stage:", s)}
            onAdd={() => setLeadDialogOpen(true)}
            onExport={() => console.log("Export leads")}
          />
          {leadsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : displayLeads.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No leads yet. Add your first lead to get started.</p>
            </div>
          ) : (
            <DataTable
              data={displayLeads}
              columns={leadColumns}
              onRowClick={(row) => console.log("Row clicked:", row)}
              actions={[
                { label: "Edit", onClick: (row) => console.log("Edit:", row) },
                { label: "Delete", onClick: (row) => console.log("Delete:", row) },
              ]}
              showSelection
              getRowId={(row) => row.id}
            />
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4 mt-6">
          <CRMTableFilters
            placeholder="Search clients..."
            addLabel="Add Client"
            onSearch={(q) => console.log("Search:", q)}
            onAdd={() => console.log("Add client")}
            onExport={() => console.log("Export clients")}
          />
          {leadsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <DataTable
              data={displayLeads.filter(l => l.stage === "closed")}
              columns={leadColumns}
              onRowClick={(row) => console.log("Row clicked:", row)}
              actions={[
                { label: "Edit", onClick: (row) => console.log("Edit:", row) },
                { label: "View Details", onClick: (row) => console.log("View:", row) },
              ]}
            />
          )}
        </TabsContent>

        <TabsContent value="deals" className="space-y-4 mt-6">
          <CRMTableFilters
            placeholder="Search deals..."
            addLabel="Add Deal"
            onSearch={(q) => console.log("Search:", q)}
            onFilterStage={(s) => console.log("Filter stage:", s)}
            onAdd={() => console.log("Add deal")}
            onExport={() => console.log("Export deals")}
          />
          {leadsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <DataTable
              data={displayLeads}
              columns={leadColumns}
              onRowClick={(row) => console.log("Row clicked:", row)}
            />
          )}
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4 mt-6">
          <CRMTableFilters
            placeholder="Search contacts..."
            addLabel="Add Contact"
            onSearch={(q) => console.log("Search:", q)}
            onAdd={() => console.log("Add contact")}
            onExport={() => console.log("Export contacts")}
          />
          {leadsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <DataTable
              data={displayLeads}
              columns={leadColumns}
              onRowClick={(row) => console.log("Row clicked:", row)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
