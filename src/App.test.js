import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("Personal Asset Calculator", () => {
  test("renders both income and expense sections", () => {
    render(<App />);
    expect(screen.getByText(/Income Total/i)).toBeInTheDocument();
    expect(screen.getByText(/Expense Total/i)).toBeInTheDocument();
  });

  test("calculates correct total for income", () => {
    render(<App />);
    const incomeTotal = screen.getByText(/Income Total: €75104.00/i);
    expect(incomeTotal).toBeInTheDocument();
  });

  test("calculates correct total for expenses", () => {
    render(<App />);
    const expenseTotal = screen.getByText(/Expense Total: €38701.00/i);
    expect(expenseTotal).toBeInTheDocument();
  });

  test("updates total when amount is changed", async () => {
    render(<App />);
    const inputFields = screen.getAllByRole("spinbutton");
    const firstInput = inputFields[0];

    await userEvent.clear(firstInput);
    await userEvent.type(firstInput, "10000");

    const incomeTotal = screen.getByText(/Income Total: €78577.00/i);
    expect(incomeTotal).toBeInTheDocument();
  });

  test("handles invalid input gracefully", async () => {
    render(<App />);
    const inputFields = screen.getAllByRole("spinbutton");
    const firstInput = inputFields[0];

    await userEvent.clear(firstInput);
    await userEvent.type(firstInput, "invalid");

    const incomeTotal = screen.getByText(/Income Total: €68577.00/i);
    expect(incomeTotal).toBeInTheDocument();
  });

  test("renders correct number of table rows", () => {
    render(<App />);
    const tableRows = screen.getAllByRole("row");
    // +1 for header row
    expect(tableRows.length).toBe(13);
  });

  test("renders both doughnut charts", () => {
    render(<App />);
    const charts = document.querySelectorAll("canvas");
    expect(charts.length).toBe(2);
  });
});
