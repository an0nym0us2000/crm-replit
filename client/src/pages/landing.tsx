import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, CheckSquare, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-lg bg-primary text-primary-foreground mb-4">
              <span className="text-2xl font-bold">L</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Launch CRM
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive internal CRM and employee management platform for managing clients, leads, deals, tasks, and team performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setLocation("/signup")}
              data-testid="button-signup"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/login")}
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            <Card>
              <CardContent className="p-6 space-y-2">
                <Briefcase className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold text-lg">CRM Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Manage leads, clients, and deals with visual pipeline tracking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-2">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold text-lg">Employee Management</h3>
                <p className="text-sm text-muted-foreground">
                  Track team performance and manage employee directories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-2">
                <CheckSquare className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold text-lg">Task Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Assign and monitor tasks with priority management
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-2">
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold text-lg">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track performance metrics and business insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
