import { Stack, Typography } from "@mui/material";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React, { useEffect, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export const removeEmptyProps = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v));
};

const calculateMonthlyPayment = ({
  homeValue,
  downPayment,
  interestRate,
  loanAmount,
  tenureYears,
  propertyTax = 0,
  homeOwnerInsurance = 0,
  pmi = 0,
  hoaFees = 0,
  utilities = 0,
  inspectionCosts = 0,
  attorneyCharges = 0,
  appraisalFees = 0,
}) => {
  // Convert annual interest rate to monthly interest rate
  const monthlyInterestRate = interestRate / 12 / 100;

  // Convert tenure from years to months
  const numberOfPayments = tenureYears * 12;

  // Calculate the loan amount
  const loanAmountValue = loanAmount ? loanAmount : homeValue - downPayment;

  // Calculate monthly payment using the formula
  const monthlyPayment =
    (loanAmountValue * monthlyInterestRate) /
    (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));

  // Calculate total payment over the life of the loan
  const totalPayment = monthlyPayment * numberOfPayments;

  const totalInterestGenerated = totalPayment - loanAmountValue;

  // Add optional costs to monthly payment
  const totalMonthlyPayment =
    monthlyPayment +
    parseInt(propertyTax) +
    parseInt(homeOwnerInsurance) +
    parseInt(pmi) +
    parseInt(hoaFees) +
    parseInt(utilities) +
    parseInt(inspectionCosts) +
    parseInt(attorneyCharges) +
    parseInt(appraisalFees);

  return {
    totalMonthlyPayment: parseInt(totalMonthlyPayment)?.toFixed(2),
    totalInterestGenerated,
    homeValue,
    propertyTax,
    homeOwnerInsurance,
    pmi,
    hoaFees,
    utilities,
    inspectionCosts,
    attorneyCharges,
    appraisalFees 
  };
};

const Result = ({ data }) => {
  const { homeValue, propertyTax, homeOwnerInsurance, totalInterestGenerated, pmi, hoaFees, utilities, inspectionCosts, attorneyCharges, appraisalFees } = calculateMonthlyPayment(data);

  const [monthlyPayments, setMonthlyPayments] = useState(0);

  const [additionalLabels, setAdditionalLabels] = useState([]);
  const [additionalValues, setAdditionalValues] = useState([]);

  const chartRef = useRef(null);

  useEffect(() => {
    // Set a timeout to delay the effect by 500 milliseconds
    const timeout = setTimeout(() => {
      const { totalMonthlyPayment: payment } = calculateMonthlyPayment(data);
      setMonthlyPayments(payment);
    }, 500);

    // Clear the timeout on component unmount or when data changes
    return () => clearTimeout(timeout);
  }, [data]);

  useEffect(() => {
    const values = removeEmptyProps({ propertyTax, homeOwnerInsurance, pmi, hoaFees, utilities, inspectionCosts, attorneyCharges, appraisalFees  });
    const labels = [];
    const dataValue = [];

    Object.entries(values).forEach(([key, value]) => {
      if (key === "propertyTax") {
        labels.push("Property tax");
        dataValue.push(value);
      } else if (key === "homeOwnerInsurance") {
        labels.push("Homeowner's insurance");
        dataValue.push(value);
      } else if (key === "pmi") {
        labels.push("PMI");
        dataValue.push(value);
      } else if (key === "hoaFees") {
        labels.push("HOA");
        dataValue.push(value);
      } else if (key === "utilities") {
        labels.push("Utilities");
        dataValue.push(value);
      } else if (key === "inspectionCosts") {
        labels.push("Inspection Costs");
        dataValue.push(value);
      } else if (key === "attorneyCharges") {
        labels.push("Attorny Charges");
        dataValue.push(value);
      } else if (key === "appraisalFees") {
        labels.push("Appraisal Fees");
        dataValue.push(value);
      }
    });
    setAdditionalLabels(labels);
    setAdditionalValues(dataValue);
  }, [propertyTax, homeOwnerInsurance, pmi, hoaFees, utilities, inspectionCosts, attorneyCharges, appraisalFees]);
  
  const options = {
    responsive: true,
    cutout: "80%",
    layout: {
      padding: 20,
    },
    borderWidth: "",
    plugins: {},
  };

  const plugin = [
    {
      id: "myPlugin",
      beforeDraw(chart) {
        const { width } = chart;
        const { height } = chart;
        const { ctx } = chart;
        ctx.restore();
        const fontSize = (height / 180).toFixed(2);
        ctx.font = `${fontSize}em sans-serif`;
        ctx.fillStyle = "white";
        ctx.textBaseline = "top";
        const text = `$${monthlyPayments}`;
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;
        ctx.fillText(text, textX, textY);
        ctx.save();
      },
    },
  ];

  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = chartRef.current;
      chartInstance.config.plugins[0].beforeDraw = plugin[0].beforeDraw;
      chartInstance.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyPayments]);

  return (
    <Stack gap={3}>
      {monthlyPayments && monthlyPayments !== "NaN" ? (
        <>
          <Typography textAlign="center" variant="h5">
            Monthly Payment: $ {monthlyPayments || 0}
          </Typography>
          <Stack direction="row" justifyContent="center">
            <div style={{ width: 500, height: 500 }}>
              <Doughnut
                data={{
                  labels: ["Principle", "Interest", ...additionalLabels],
                  datasets: [
                    {
                      label: "Ratio of Principle and Interest",
                      data: [
                        homeValue,
                        totalInterestGenerated,
                        ...additionalValues,
                      ],
                      borderWidth: 1,
                      backgroundColor: [
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(54, 162, 235, 0.2)",
                        "rgba(255, 206, 86, 0.2)",
                        "rgba(75, 192, 192, 0.2)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                        "rgba(0, 204, 102, 1)",
                        "rgba(255, 0, 255, 1)",
                        "rgba(0, 204, 204, 1)",
                        "rgba(255, 153, 0, 1)",
                        "rgba(204, 0, 102, 1)",
                      ],
                      borderColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                        "rgba(0, 204, 102, 1)",
                        "rgba(255, 0, 255, 1)",
                        "rgba(0, 204, 204, 1)",
                        "rgba(255, 153, 0, 1)",
                        "rgba(204, 0, 102, 1)",
                    ],
                    },
                  ],
                }}
                options={options}
                plugins={plugin}
                ref={chartRef}
              />
            </div>
          </Stack>
        </>
      ) : (
        <></>
      )}
    </Stack>
  );
};

export default Result;
