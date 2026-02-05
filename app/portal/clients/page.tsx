"use client"

import { useState } from "react"
import { PortalLayout } from "@/components/portal-layout"
import { ClientsListView } from "@/components/clients-list-view"
import { ClientsBoardView } from "@/components/clients-board-view"
import { ClientProfileSheet } from "@/components/client-profile-sheet"
import { AddClientDialog } from "@/components/add-client-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, List, LayoutGrid } from "lucide-react"
import type { Client } from "@/lib/crm-data"
import { useClients } from "@/hooks/use-clients"

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "board">("list")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { clients, isLoading, refresh } = useClients()

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground">Manage your client relationships and pipeline</p>
          </div>
          <div className="flex items-center space-x-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "board")}>
              <TabsList>
                <TabsTrigger value="list" className="flex items-center space-x-2">
                  <List className="h-4 w-4" />
                  <span>List</span>
                </TabsTrigger>
                <TabsTrigger value="board" className="flex items-center space-x-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Board</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "board")}>
          <TabsContent value="list">
            <ClientsListView 
              clients={clients} 
              isLoading={isLoading} 
              onClientSelect={setSelectedClient} 
              onRefresh={refresh}
            />
          </TabsContent>
          <TabsContent value="board">
            <ClientsBoardView 
              clients={clients}
              isLoading={isLoading}
              onClientSelect={setSelectedClient} 
            />
          </TabsContent>
        </Tabs>

        <ClientProfileSheet 
          client={selectedClient} 
          isOpen={!!selectedClient} 
          onClose={() => setSelectedClient(null)} 
        />

        <AddClientDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onClientAdded={refresh}
        />
      </div>
    </PortalLayout>
  )
}
