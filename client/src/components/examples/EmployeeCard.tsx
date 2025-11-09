import { EmployeeCard } from "../employee-card";

export default function EmployeeCardExample() {
  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        <EmployeeCard
          id="1"
          name="John Doe"
          role="Senior Developer"
          department="Engineering"
          status="active"
          email="john.doe@company.com"
          phone="+1 (555) 123-4567"
          performanceScore={92}
          onClick={() => console.log("Employee card clicked")}
        />
        <EmployeeCard
          id="2"
          name="Sarah Smith"
          role="Product Manager"
          department="Product"
          status="active"
          email="sarah.smith@company.com"
          phone="+1 (555) 234-5678"
          performanceScore={88}
          onClick={() => console.log("Employee card clicked")}
        />
        <EmployeeCard
          id="3"
          name="Mike Johnson"
          role="Sales Manager"
          department="Sales"
          status="inactive"
          email="mike.johnson@company.com"
          phone="+1 (555) 345-6789"
          performanceScore={75}
          onClick={() => console.log("Employee card clicked")}
        />
      </div>
    </div>
  );
}
