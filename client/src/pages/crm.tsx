import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, Column } from "@/components/data-table";
import { CRMTableFilters } from "@/components/crm-table-filters";
import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";

type Lead = {
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

  const mockLeads: Lead[] = [
    { id: "1", name: "John Smith", company: "Acme Corp", email: "john@acme.com", stage: "lead", assignedTo: "Sarah Smith", lastContact: "2 days ago" },
    { id: "2", name: "Jane Doe", company: "TechStart", email: "jane@techstart.com", stage: "negotiation", assignedTo: "John Doe", lastContact: "1 day ago" },
    { id: "3", name: "Bob Wilson", company: "InnovateCo", email: "bob@innovate.com", stage: "closed", assignedTo: "Mike Johnson", lastContact: "5 hours ago" },
    { id: "4", name: "Alice Brown", company: "BrandX", email: "alice@brandx.com", stage: "lead", assignedTo: "Emily Davis", lastContact: "3 days ago" },
    { id: "5", name: "Charlie Green", company: "GlobalTech", email: "charlie@global.com", stage: "negotiation", assignedTo: "Alex Chen", lastContact: "1 week ago" },
  ];

  const leadColumns: Column<Lead>[] = [
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
            onAdd={() => console.log("Add lead")}
            onExport={() => console.log("Export leads")}
          />
          <DataTable
            data={mockLeads}
            columns={leadColumns}
            onRowClick={(row) => console.log("Row clicked:", row)}
            actions={[
              { label: "Edit", onClick: (row) => console.log("Edit:", row) },
              { label: "Delete", onClick: (row) => console.log("Delete:", row) },
            ]}
            showSelection
            getRowId={(row) => row.id}
          />
        </TabsContent>

        <TabsContent value="clients" className="space-y-4 mt-6">
          <CRMTableFilters
            placeholder="Search clients..."
            addLabel="Add Client"
            onSearch={(q) => console.log("Search:", q)}
            onAdd={() => console.log("Add client")}
            onExport={() => console.log("Export clients")}
          />
          <DataTable
            data={mockLeads.filter(l => l.stage === "closed")}
            columns={leadColumns}
            onRowClick={(row) => console.log("Row clicked:", row)}
            actions={[
              { label: "Edit", onClick: (row) => console.log("Edit:", row) },
              { label: "View Details", onClick: (row) => console.log("View:", row) },
            ]}
          />
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
          <DataTable
            data={mockLeads}
            columns={leadColumns}
            onRowClick={(row) => console.log("Row clicked:", row)}
          />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4 mt-6">
          <CRMTableFilters
            placeholder="Search contacts..."
            addLabel="Add Contact"
            onSearch={(q) => console.log("Search:", q)}
            onAdd={() => console.log("Add contact")}
            onExport={() => console.log("Export contacts")}
          />
          <DataTable
            data={mockLeads}
            columns={leadColumns}
            onRowClick={(row) => console.log("Row clicked:", row)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
