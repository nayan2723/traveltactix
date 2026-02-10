import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EmptyState } from "@/components/EmptyState";
import { Trophy } from "lucide-react";

describe("EmptyState", () => {
  it("renders title and description", () => {
    const { getByText } = render(
      <EmptyState title="No items" description="Add some items to get started" />
    );
    expect(getByText("No items")).toBeInTheDocument();
    expect(getByText("Add some items to get started")).toBeInTheDocument();
  });

  it("renders custom icon", () => {
    const { getByText } = render(<EmptyState icon={Trophy} title="No badges" />);
    expect(getByText("No badges")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const onAction = vi.fn();
    const { getByText } = render(
      <EmptyState title="Empty" actionLabel="Add Item" onAction={onAction} />
    );
    expect(getByText("Add Item")).toBeInTheDocument();
  });
});
