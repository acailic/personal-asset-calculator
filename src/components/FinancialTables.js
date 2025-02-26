import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Grid,
  IconButton,
  Button,
  Typography,
  Stack,
  TableFooter,
} from "@mui/material";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut } from "react-chartjs-2";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoIcon from "@mui/icons-material/Info";
import initialData from "../data/initialData.json";
import Swal from "sweetalert2";
import { translations } from "../translations";
import MUIDataTable from "mui-datatables";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const FinancialTables = ({ language }) => {
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [expenseEntries, setExpenseEntries] = useState([]);
  const [categories, setCategories] = useState({ income: [], expenses: [] });

  const t = translations[language]; // Get current language translations

  useEffect(() => {
    // Load initial data
    setIncomeEntries(initialData.income);
    setExpenseEntries(initialData.expenses);
    setCategories(initialData.metadata.categories);
  }, []);

  const calculateTotal = (entries) => {
    return entries.reduce((sum, entry) => sum + entry.amount, 0);
  };

  const addNewEntry = (entries, setEntries, isIncome = false) => {
    setEntries([...entries, { description: "", amount: 0 }]);

    const toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
      willClose: () => {
        const container = document.querySelector(".swal2-container");
        if (container) {
          container.remove();
        }
      },
    });

    if (isIncome) {
      toast.fire({
        icon: "success",
        title: t.income.newSource,
        text: t.income.keepGrowing,
        background: "#4a6da7",
        color: "#fff",
        customClass: {
          popup: "animated bounceIn",
        },
      });
    } else {
      toast.fire({
        icon: "warning",
        title: t.expense.newExpense,
        text: t.expense.trackWisely,
        background: "#e17055",
        color: "#fff",
        customClass: {
          popup: "animated fadeIn",
        },
      });
    }
  };

  const removeEntry = (index, entries, setEntries, isIncome = false) => {
    const entry = entries[index];
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);

    if (entry.amount <= 0) return;

    const toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
      willClose: () => {
        const container = document.querySelector(".swal2-container");
        if (container) {
          container.remove();
        }
      },
    });

    if (isIncome) {
      toast.fire({
        icon: "error",
        title: t.income.removed,
        text: `${t.income.removedAmount}${entry.amount.toFixed(2)}`,
        background: "#d63031",
        color: "#fff",
        customClass: {
          popup: "animated fadeIn",
        },
      });
    } else {
      toast.fire({
        icon: "success",
        title: t.expense.removed,
        text: `${t.expense.savedAmount}${entry.amount.toFixed(2)}`,
        background: "#00b894",
        color: "#fff",
        customClass: {
          popup: "animated bounceIn",
        },
      });
    }
  };

  const getChartData = (entries, title) => {
    const total = calculateTotal(entries);
    const colors =
      title === "Prihodi"
        ? [
            "rgba(74, 109, 167, 1)",
            "rgba(99, 132, 198, 1)",
            "rgba(122, 155, 229, 1)",
            "rgba(146, 178, 255, 1)",
            "rgba(169, 201, 255, 1)",
          ]
        : [
            "rgba(225, 112, 85, 1)",
            "rgba(255, 140, 105, 1)",
            "rgba(255, 160, 122, 1)",
            "rgba(255, 179, 138, 1)",
            "rgba(255, 198, 154, 1)",
            "rgba(255, 217, 170, 1)",
            "rgba(255, 236, 186, 1)",
          ];

    const hoverColors = colors.map((color) => color.replace("1)", "0.9)"));
    const borderColors = colors.map((color) => color.replace("1)", "0.95)"));

    return {
      labels: entries.map((entry) => entry.description || "New Entry"),
      datasets: [
        {
          data: entries.map((entry) => entry.amount),
          backgroundColor: colors,
          hoverBackgroundColor: hoverColors,
          borderColor: borderColors,
          borderWidth: 2,
          percentages: entries.map((entry) =>
            ((entry.amount / total) * 100).toFixed(1)
          ),
        },
      ],
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 9,
          },
          generateLabels: (chart) => {
            const data = chart.data;
            const total = data.datasets[0].data.reduce(
              (sum, value) => sum + value,
              0
            );

            return data.labels.map((label, index) => ({
              text: `${label} (${(
                (data.datasets[0].data[index] / total) *
                100
              ).toFixed(1)}%)`,
              fillStyle: data.datasets[0].backgroundColor[index],
              strokeStyle: data.datasets[0].borderColor[index],
              lineWidth: 1,
              hidden: false,
              index: index,
            }));
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce(
              (sum, val) => sum + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return [
              `Amount: € ${value.toFixed(2)}`,
              `Percentage: ${percentage}%`,
            ];
          },
        },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#666",
        bodyColor: "#666",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 11 },
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: "rgba(0,0,0,0.1)",
        borderWidth: 1,
        animation: {
          duration: 400,
          easing: "easeOutQuart",
        },
      },
      datalabels: {
        color: "white",
        font: {
          size: 9,
          weight: "bold",
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `€${value.toFixed(0)}\n${percentage}%`;
        },
        textAlign: "center",
        display: function (context) {
          const value = context.dataset.data[context.dataIndex];
          const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
          return (value / total) * 100 > 5;
        },
        offset: 8,
        textStrokeColor: "rgba(0,0,0,0.3)",
        textStrokeWidth: 2,
        textShadowBlur: 3,
        textShadowColor: "rgba(0,0,0,0.3)",
      },
    },
    cutout: "60%",
    radius: "90%",
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
      easing: "easeInOutQuart",
    },
    hover: {
      mode: "nearest",
      intersect: true,
      animationDuration: 200,
    },
    transitions: {
      active: {
        animation: {
          duration: 300,
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "white",
        hoverBorderWidth: 3,
        hoverBorderColor: "white",
        hoverOffset: 5,
      },
    },
    interaction: {
      mode: "nearest",
      intersect: true,
      includeInvisible: false,
    },
  };

  const renderTable = (isIncome, entries, setEntries) => {
    const columns = [
      {
        name: "description",
        label: isIncome ? t.income.title : t.expense.title,
        options: {
          filter: true,
          sort: true,
          setCellProps: () => ({
            style: {
              width: "70%",
              maxWidth: "none",
              padding: "1px 2px",
            },
          }),
          customBodyRender: (value, tableMeta) => (
            <TextField
              fullWidth
              size="small"
              value={value}
              onChange={(e) => {
                const newEntries = [...entries];
                newEntries[tableMeta.rowIndex].description = e.target.value;
                setEntries(newEntries);
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& input": {
                    py: 0.1,
                    px: 0.25,
                    height: "1.4em",
                    fontSize: "1.33rem",
                    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                    lineHeight: "1.4em",
                  },
                  height: "24px",
                },
              }}
            />
          ),
        },
      },
      {
        name: "amount",
        label: isIncome ? t.income.amount : t.expense.amount,
        options: {
          filter: true,
          sort: true,
          setCellProps: () => ({
            style: {
              width: "25%",
              maxWidth: "none",
              padding: "1px 2px",
            },
          }),
          customBodyRender: (value, tableMeta) => (
            <TextField
              size="small"
              type="number"
              value={value}
              onChange={(e) => {
                const newEntries = [...entries];
                newEntries[tableMeta.rowIndex].amount =
                  parseFloat(e.target.value) || 0;
                setEntries(newEntries);
              }}
              InputProps={{
                startAdornment: "€",
              }}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  "& input": {
                    py: 0.1,
                    px: 0.25,
                    height: "1.4em",
                    fontSize: "1.33rem",
                    textAlign: "right",
                    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                    lineHeight: "1.4em",
                  },
                  height: "24px",
                },
              }}
            />
          ),
        },
      },
      {
        name: "actions",
        label: " ",
        options: {
          filter: false,
          sort: false,
          setCellProps: () => ({
            style: {
              width: "5%",
              minWidth: "24px",
              maxWidth: "24px",
              padding: "1px 0 1px 2px",
              overflow: "visible",
            },
          }),
          setCellHeaderProps: () => ({
            style: {
              width: "24px",
              minWidth: "24px",
              maxWidth: "24px",
              padding: "4px 0 4px 2px",
            },
          }),
          customBodyRender: (value, tableMeta) => (
            <IconButton
              size="small"
              onClick={() =>
                removeEntry(tableMeta.rowIndex, entries, setEntries, isIncome)
              }
              sx={{
                p: 0,
                width: "24px",
                height: "24px",
                display: "flex",
                justifyContent: "flex-start",
                "& .MuiSvgIcon-root": {
                  fontSize: "1.26rem",
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          ),
        },
      },
    ];

    const options = {
      filter: false,
      search: false,
      print: false,
      download: false,
      viewColumns: false,
      selectableRows: "none",
      pagination: false,
      responsive: "standard",
      elevation: 0,
      tableBodyHeight: "auto",
      customToolbar: null,
      sortOrder: {
        name: "amount",
        direction: "desc",
      },
      setTableProps: () => ({
        size: "small",
        padding: "none",
        style: {
          width: "100%",
          tableLayout: "fixed",
        },
      }),
      customFooter: () => (
        <TableFooter>
          <TableRow
            hover
            onClick={() => addNewEntry(entries, setEntries, isIncome)}
            sx={{
              cursor: "pointer",
              borderTop: "1px dashed rgba(224, 224, 224, 0.4)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04) !important",
              },
            }}
          >
            <TableCell
              colSpan={3}
              sx={{
                py: 0.5,
                px: 1,
                color: isIncome ? "#4a6da7" : "#e17055",
                fontSize: "1.26rem",
                textAlign: "center",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                height: "32px",
              }}
            >
              <AddIcon sx={{ fontSize: "1.4rem" }} />
              {isIncome ? t.income.addRow : t.expense.addRow}
            </TableCell>
          </TableRow>
        </TableFooter>
      ),
    };

    return (
      <Grid container spacing={0.5} alignItems="center">
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              position: "relative",
              maxWidth: "100%",
              width: "100%",
              marginLeft: 0,
              "& .MuiPaper-root": {
                boxShadow: "none",
                border: "1px solid rgba(224, 224, 224, 1)",
                width: "100%",
                minWidth: "300px",
                maxWidth: "100%",
                borderRadius: "4px",
                overflow: "hidden",
              },
              "& .MuiTableRow-root": {
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              },
              "& .MuiTableHead-root": {
                "& .MuiTableCell-head": {
                  backgroundColor: isIncome ? "#4a6da7" : "#e17055",
                  backgroundImage: `linear-gradient(to right, ${
                    isIncome ? "#4a6da7, #6384c6" : "#e17055, #ff8c69"
                  })`,
                  color: "white",
                  fontSize: "1.33rem",
                  fontWeight: 600,
                  padding: "4px 2px",
                  borderBottom: "none",
                  whiteSpace: "nowrap",
                  height: "36px",
                  lineHeight: "36px",
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  position: "relative",
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0))",
                    pointerEvents: "none",
                  },
                  "&:first-of-type": {
                    borderTopLeftRadius: "4px",
                  },
                  "&:last-of-type": {
                    borderTopRightRadius: "4px",
                  },
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundImage: `linear-gradient(to right, ${
                      isIncome ? "#5a7db7, #7394d6" : "#f18065, #ff9c79"
                    })`,
                  },
                },
                "& .MuiTableRow-head": {
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                },
              },
              "& .MuiTableBody-root": {
                "& .MuiTableCell-body": {
                  padding: 0,
                  height: "26px",
                  lineHeight: "26px",
                },
              },
              "& .MuiTable-root": {
                width: "100%",
                tableLayout: "fixed",
              },
              "& .MuiTableContainer-root": {
                width: "100%",
                maxWidth: "100%",
              },
              "& .MuiOutlinedInput-root": {
                margin: 0,
                height: "24px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.12)",
                  borderWidth: "1px",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.24)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: isIncome ? "#4a6da7" : "#e17055",
                  borderWidth: "1px",
                },
                "& .MuiInputAdornment-root": {
                  height: "24px",
                  maxHeight: "24px",
                },
              },
              "& .MuiInputBase-input": {
                height: "24px !important",
                minHeight: "24px !important",
                maxHeight: "24px !important",
              },
              "& .MUIDataTableToolbar-root": {
                display: "none",
              },
              "& .MUIDataTableBodyCell-root": {
                "&:last-child": {
                  width: "28px",
                  minWidth: "28px",
                  maxWidth: "28px",
                  padding: "1px 0 1px 4px",
                },
              },
            }}
          >
            <MUIDataTable
              title=""
              data={entries}
              columns={columns}
              options={options}
            />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={7}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "100%",
            pl: { md: 4 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 540,
              height: 360,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              margin: 0,
              marginLeft: 0,
              border: "1px solid rgba(224, 224, 224, 1)",
              borderRadius: "8px",
              padding: 2,
              backgroundColor: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              position: "relative",
            }}
          >
            <Doughnut
              data={getChartData(entries, isIncome ? "Prihodi" : "Rashodi")}
              options={chartOptions}
            />
          </Box>
        </Grid>
      </Grid>
    );
  };

  const renderSummary = () => {
    const totalIncome = calculateTotal(incomeEntries);
    const totalExpenses = calculateTotal(expenseEntries);
    const balance = totalIncome - totalExpenses;
    const isPositive = balance >= 0;
    const savingsRate =
      totalIncome > 0
        ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)
        : 0;

    return (
      <Grid container spacing={0.5} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={2.6}>
          <Paper
            sx={{
              p: 0.75,
              bgcolor: "#4a6da7",
              color: "white",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: "0.65rem" }}>
              {t.summary.totalIncome}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: "0.9rem" }}>
              € {totalIncome.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.7}>
          <Paper
            sx={{
              p: 0.75,
              bgcolor: "#e17055",
              color: "white",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: "0.65rem" }}>
              {t.summary.totalExpenses}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: "0.9rem" }}>
              € {totalExpenses.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.7}>
          <Paper
            sx={{
              p: 0.75,
              bgcolor: isPositive ? "#00b894" : "#d63031",
              color: "white",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: "0.65rem" }}>
              {t.summary.balance}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: "0.9rem" }}>
              € {balance.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.7}>
          <Paper
            sx={{
              p: 0.75,
              bgcolor: "#6c5ce7",
              color: "white",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: "0.65rem" }}>
              {t.summary.savingsRate}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: "0.9rem" }}>
              {savingsRate}%
            </Typography>
          </Paper>
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={1.3}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            height: "100%",
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".json"
            onChange={handleImport}
          />
          <Stack direction="row" spacing={0.5}>
            <IconButton
              onClick={() => fileInputRef.current.click()}
              size="small"
              sx={{
                padding: 0.75,
                borderRadius: 1,
                border: "1px solid rgba(0, 0, 0, 0.12)",
                color: "#666",
                width: "32px",
                height: "32px",
                "&:hover": {
                  borderColor: "rgba(0, 0, 0, 0.24)",
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <FileUploadIcon sx={{ fontSize: "1.3rem" }} />
            </IconButton>
            <IconButton
              onClick={handleExport}
              size="small"
              sx={{
                padding: 0.75,
                borderRadius: 1,
                border: "1px solid rgba(0, 0, 0, 0.12)",
                color: "#666",
                width: "32px",
                height: "32px",
                "&:hover": {
                  borderColor: "rgba(0, 0, 0, 0.24)",
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <FileDownloadIcon sx={{ fontSize: "1.3rem" }} />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    );
  };

  const fileInputRef = useRef(null);

  const handleExport = () => {
    const data = {
      income: incomeEntries,
      expenses: expenseEntries,
      metadata: {
        currency: "EUR",
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
        categories: categories,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `financial-data-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.income && data.expenses) {
            setIncomeEntries(data.income);
            setExpenseEntries(data.expenses);
            if (data.metadata?.categories) {
              setCategories(data.metadata.categories);
            }
          } else {
            alert("Invalid file format. Please use a valid export file.");
          }
        } catch (error) {
          alert("Error reading file. Please make sure it's a valid JSON file.");
        }
      };
      reader.readAsText(file);
    }
    event.target.value = null;
  };

  return (
    <Box
      sx={{
        p: 0.5,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(120deg,
              rgba(74, 109, 167, 0.08) 0%,
              rgba(108, 92, 231, 0.08) 25%,
              rgba(0, 184, 148, 0.08) 50%,
              rgba(225, 112, 85, 0.08) 75%,
              rgba(74, 109, 167, 0.08) 100%
            )
          `,
          backgroundSize: "400% 400%",
          animation: "gradientBG 20s ease infinite",
          zIndex: -1,
          borderRadius: "12px",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 50% 50%,
              rgba(255, 255, 255, 0.1) 0%,
              transparent 70%
            ),
            radial-gradient(circle at 0% 0%,
              rgba(74, 109, 167, 0.08) 0%,
              transparent 50%
            ),
            radial-gradient(circle at 100% 100%,
              rgba(0, 184, 148, 0.08) 0%,
              transparent 50%
            )
          `,
          backgroundSize: "200% 200%, 100% 100%, 100% 100%",
          animation: "cosmicDust 15s ease infinite",
          zIndex: -1,
          opacity: 0.8,
          mixBlendMode: "soft-light",
        },
        "@keyframes gradientBG": {
          "0%": {
            backgroundPosition: "0% 50%",
            backgroundSize: "400% 400%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
            backgroundSize: "300% 300%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
            backgroundSize: "400% 400%",
          },
        },
        "@keyframes cosmicDust": {
          "0%": {
            backgroundPosition: "0% 0%, 0% 0%, 100% 100%",
            filter: "hue-rotate(0deg)",
          },
          "50%": {
            backgroundPosition: "100% 100%, 100% 0%, 0% 100%",
            filter: "hue-rotate(15deg)",
          },
          "100%": {
            backgroundPosition: "0% 0%, 0% 0%, 100% 100%",
            filter: "hue-rotate(0deg)",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          p: 1,
          borderRadius: "12px",
          background: `
            linear-gradient(135deg,
              rgba(74, 109, 167, 0.12) 0%,
              rgba(74, 109, 167, 0.18) 100%
            )
          `,
          border: "1px solid rgba(74, 109, 167, 0.25)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(90deg,
                transparent,
                rgba(255,255,255,0.2),
                transparent
              )
            `,
            transform: "translateX(-100%)",
            animation: "shimmer 3s infinite ease-in-out",
          },
          "@keyframes shimmer": {
            "0%": {
              transform: "translateX(-100%) skewX(-15deg)",
            },
            "100%": {
              transform: "translateX(100%) skewX(-15deg)",
            },
          },
        }}
      >
        <InfoIcon sx={{ fontSize: "1.2rem", color: "#4a6da7" }} />
        <Typography
          variant="body2"
          sx={{
            color: "#4a6da7",
            fontSize: "0.9rem",
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          Sample data loaded - Use import/export buttons in the top right to
          manage your data
        </Typography>
      </Box>
      {renderSummary()}
      {renderTable(true, incomeEntries, setIncomeEntries)}
      {renderTable(false, expenseEntries, setExpenseEntries)}
    </Box>
  );
};

// Add some CSS for animations
const style = document.createElement("style");
style.textContent = `
  @keyframes bounceIn {
    from { transform: scale(0.3); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animated {
    animation-duration: 0.3s;
    animation-fill-mode: both;
  }
  .bounceIn {
    animation-name: bounceIn;
  }
  .fadeIn {
    animation-name: fadeIn;
  }
`;
document.head.appendChild(style);

export default FinancialTables;
