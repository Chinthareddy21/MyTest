import path from "path";
import AdmZip from "adm-zip";
import ExcelJS from "exceljs";
import * as fs from "fs";

async function globalTeardown(): Promise<void> {
    try {
        /* Step 1: Read JSON file */
        const jsonFile = path.join(__dirname, "report.json");
        if (fs.existsSync(jsonFile)) {
            const rawData = fs.readFileSync(jsonFile, "utf-8");
            const jsonData = JSON.parse(rawData);

            /* Step 2: Extract all test results */
            const allResults: any[] = [];
            if (jsonData.runs && Array.isArray(jsonData.runs)) {
                jsonData.runs.forEach((run: any) => {
                    if (Array.isArray(run.testResults)) {
                        run.testResults.forEach((res: any) => {
                            allResults.push({
                                runStartTime: run.runStartTime,
                                timestamp: res.timestamp,
                                systemInfo: res.systemInfo,
                                browser: res.browser,
                                url: res.url,
                                status: res.status,
                                success: res.success,
                            });
                        });
                    }
                });
            }

            /* Step 3: Create Excel workbook */
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("TestData");

            if (allResults.length > 0) {
                /* Step 4: Add headers with styling */
                const headers = Object.keys(allResults[0]);
                const headerRow = worksheet.addRow(headers);

                headerRow.eachCell((cell) => {
                    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "4472C4" }, // Blue background
                    };
                    cell.alignment = { vertical: "middle", horizontal: "center" };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                });

                /* Step 5: Add rows with borders */
                allResults.forEach((row) => {
                    const dataRow = worksheet.addRow(Object.values(row));
                    dataRow.eachCell((cell) => {
                        cell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" },
                        };
                    });
                });

                /* Step 6: Auto-fit columns */
                worksheet.columns.forEach((column) => {
                    let maxLength = 10;
                    if (column && typeof column.eachCell === "function") {
                        column.eachCell({ includeEmpty: true }, (cell) => {
                            const cellValue = cell.value ? cell.value.toString() : "";
                            maxLength = Math.max(maxLength, cellValue.length);
                        });
                    }
                    column.width = maxLength + 2;
                });

                /* Step 7: Save Excel file inside report folder */
                const reportFolder = path.join(__dirname, "playwright-report");
                if (!fs.existsSync(reportFolder)) {
                    fs.mkdirSync(reportFolder, { recursive: true });
                }

                const excelPath = path.join(reportFolder, "output.xlsx");
                await workbook.xlsx.writeFile(excelPath);
                console.log(`Styled Excel file created at: ${excelPath}`);


                /* Step 8: Save Excel file outside report folder too */
                const excelOutside = path.join(__dirname, "output.xlsx");
                await workbook.xlsx.writeFile(excelOutside);
                console.log(`Styled Excel file also created at: ${excelOutside}`);
            } else {
                console.warn("No test results found, skipping Excel export.");
            }
        } else {
            console.warn("JSON file not found, skipping Excel export.");
        }

        /* Step 8: Zip the Playwright HTML report (including Excel file) */
        const reportFolder = path.join(__dirname, "playwright-report");
        if (fs.existsSync(reportFolder)) {
            const zip = new AdmZip();
            zip.addLocalFolder(reportFolder, "playwright-report");
            const zipPath = path.join(__dirname, "playwright-report.zip");
            zip.writeZip(zipPath);
            console.log(`Report zipped at: ${zipPath}`);
        } else {
            console.warn("Report folder not found, skipping zip.");
        }
    } catch (error) {
        console.error("Error in globalTeardown:", error);
    }
}

export default globalTeardown;
