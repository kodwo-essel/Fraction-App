import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatCurrency } from './allocation';

export interface ReportData {
    name: string;
    date: string;
    description?: string;
    total: number;
    currencyCode: string;
    items: Array<{
        categoryName: string;
        amount: number;
        percentage: number;
        color: string;
    }>;
}

export const generateAllocationReport = async (data: ReportData) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fraction - Allocation Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        
        :root {
            --primary: #6366f1;
            --success: #22c55e;
            --text: #1e293b;
            --text-secondary: #64748b;
            --border: #e2e8f0;
            --background: #f8fafc;
            --surface: #ffffff;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: var(--text);
            background-color: var(--background);
            margin: 0;
            padding: 40px;
            line-height: 1.5;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 48px;
        }

        .brand {
            display: flex;
            flex-direction: column;
        }

        .brand h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: -1px;
            color: var(--primary);
            font-weight: 700;
        }

        .report-type {
            font-size: 14px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
        }

        .date-box {
            text-align: right;
            font-size: 14px;
            color: var(--text-secondary);
        }

        .summary-card {
            background: var(--surface);
            border-radius: 16px;
            padding: 32px;
            border: 1px solid var(--border);
            margin-bottom: 32px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        }

        .summary-title {
            font-size: 14px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .allocation-name {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 16px 0;
        }

        .total-row {
            display: flex;
            align-items: baseline;
            gap: 12px;
            padding-top: 24px;
            border-top: 1px dashed var(--border);
        }

        .total-label {
            font-size: 16px;
            color: var(--text-secondary);
        }

        .total-value {
            font-size: 32px;
            font-weight: 700;
            color: var(--success);
        }

        .section-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 20px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid var(--border);
        }

        /* Distribution Bar */
        .chart-container {
            margin-bottom: 40px;
        }

        .distribution-bar {
            height: 32px;
            display: flex;
            width: 100%;
            border-radius: 16px;
            overflow: hidden;
            background: var(--border);
            margin-bottom: 20px;
        }

        .bar-segment {
            height: 100%;
        }

        /* Table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th {
            text-align: left;
            padding: 12px 16px;
            font-size: 12px;
            text-transform: uppercase;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border);
        }

        td {
            padding: 16px;
            border-bottom: 1px solid var(--border);
            font-size: 15px;
        }

        .category-cell {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .color-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }

        .amount-cell {
            font-weight: 600;
            text-align: right;
        }

        .percent-cell {
            color: var(--text-secondary);
            text-align: center;
        }

        .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 12px;
            color: var(--text-secondary);
            border-top: 1px solid var(--border);
            padding-top: 24px;
        }

        @media print {
            body { padding: 0; background: white; }
            .summary-card { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">
            <h1>FRACTION</h1>
            <div class="report-type">Disbursement Analysis</div>
        </div>
        <div class="date-box">
            Generated on ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
    </div>

    <div class="summary-card">
        <div class="summary-title">Allocation Overview</div>
        <h2 class="allocation-name">${data.name}</h2>
        ${data.description ? `<p style="color: var(--text-secondary); margin-bottom: 24px;">${data.description}</p>` : ''}
        
        <div class="total-row">
            <span class="total-label">Total Volume</span>
            <span class="total-value">${formatCurrency(data.total, data.currencyCode)}</span>
        </div>
    </div>

    <div class="chart-container">
        <h3 class="section-title">Distribution Heatmap</h3>
        <div class="distribution-bar">
            ${data.items.map(item => `
                <div class="bar-segment" style="width: ${item.percentage}%; background-color: ${item.color};"></div>
            `).join('')}
        </div>
    </div>

    <div class="list-container">
        <h3 class="section-title">Itemized Breakdown</h3>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th style="text-align: center;">Weight</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map(item => `
                    <tr>
                        <td>
                            <div class="category-cell">
                                <div class="color-dot" style="background-color: ${item.color};"></div>
                                ${item.categoryName}
                            </div>
                        </td>
                        <td class="percent-cell">${Math.round(item.percentage)}%</td>
                        <td class="amount-cell">${formatCurrency(item.amount, data.currencyCode)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        Fraction Financial Manager &bull; Accurate &bull; Local &bull; Private
    </div>
</body>
</html>
    `;

    try {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
        console.error('Failed to generate PDF:', error);
        throw error;
    }
};

export interface SummaryReportData {
    userName: string;
    currencyCode: string;
    metrics: {
        totalIncome: number;
        totalExpense: number;
        netSavings: number;
        savingsRate: number;
        totalCount: number;
    };
    monthlyTrends: Array<{ label: string; income: number; expense: number }>;
    topCategories: Array<{ name: string; amount: number; count: number }>;
}

export const generateSummaryReport = async (data: SummaryReportData) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fraction - Financial Summary</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        
        :root {
            --primary: #6366f1;
            --success: #22c55e;
            --error: #ef4444;
            --text: #1e293b;
            --text-secondary: #64748b;
            --border: #e2e8f0;
            --background: #f8fafc;
            --surface: #ffffff;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: var(--text);
            background-color: var(--background);
            margin: 0;
            padding: 40px;
            line-height: 1.5;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 48px;
        }

        .brand h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: -1px;
            color: var(--primary);
            font-weight: 700;
        }

        .report-type {
            font-size: 14px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
        }

        .date-box {
            text-align: right;
            font-size: 14px;
            color: var(--text-secondary);
        }

        .section-title {
            font-size: 14px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
            font-weight: 700;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 40px;
        }

        .metric-card {
            background: var(--surface);
            border-radius: 12px;
            padding: 24px;
            border: 1px solid var(--border);
        }

        .metric-label {
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 4px;
        }

        .metric-value {
            font-size: 24px;
            font-weight: 700;
        }

        .metric-value.success { color: var(--success); }
        .metric-value.error { color: var(--error); }

        .data-card {
            background: var(--surface);
            border-radius: 12px;
            padding: 24px;
            border: 1px solid var(--border);
            margin-bottom: 32px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            text-align: left;
            padding: 12px 16px;
            font-size: 11px;
            text-transform: uppercase;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border);
        }

        td {
            padding: 16px;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
        }

        .amount-cell {
            text-align: right;
            font-weight: 600;
        }

        .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 12px;
            color: var(--text-secondary);
            border-top: 1px solid var(--border);
            padding-top: 24px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">
            <h1>FRACTION</h1>
            <div class="report-type">Financial Analytics Overview</div>
        </div>
        <div class="date-box">
            For ${data.userName}<br>
            Generated on ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
    </div>

    <div class="section-title">Lifetime Performance Summary</div>
    <div class="summary-grid">
        <div class="metric-card">
            <div class="metric-label">Total Lifetime Income</div>
            <div class="metric-value success">+${formatCurrency(data.metrics.totalIncome, data.currencyCode)}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Total Lifetime Expenses</div>
            <div class="metric-value error">-${formatCurrency(data.metrics.totalExpense, data.currencyCode)}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Net Accumulated Savings</div>
            <div class="metric-value">${formatCurrency(data.metrics.netSavings, data.currencyCode)}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Lifetime Savings Rate</div>
            <div class="metric-value" style="color: var(--primary)">${data.metrics.savingsRate.toFixed(1)}%</div>
        </div>
    </div>

    <div class="section-title">Monthly Trend Analysis</div>
    <div class="data-card">
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    <th style="text-align: right;">Income</th>
                    <th style="text-align: right;">Expenses</th>
                    <th style="text-align: right;">Net</th>
                </tr>
            </thead>
            <tbody>
                ${data.monthlyTrends.map(m => `
                    <tr>
                        <td>${m.label}</td>
                        <td class="amount-cell" style="color: var(--success)">+${formatCurrency(m.income, data.currencyCode)}</td>
                        <td class="amount-cell" style="color: var(--error)">-${formatCurrency(m.expense, data.currencyCode)}</td>
                        <td class="amount-cell">${formatCurrency(m.income - m.expense, data.currencyCode)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section-title">Top Spending Categories</div>
    <div class="data-card">
        <table>
            <thead>
                <tr>
                    <th>Category Name</th>
                    <th style="text-align: center;">Frequency</th>
                    <th style="text-align: right;">Total Spent</th>
                </tr>
            </thead>
            <tbody>
                ${data.topCategories.map(cat => `
                    <tr>
                        <td style="font-weight: 500;">${cat.name}</td>
                        <td style="text-align: center; color: var(--text-secondary);">${cat.count} txs</td>
                        <td class="amount-cell" style="color: var(--error)">-${formatCurrency(cat.amount, data.currencyCode)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        Fraction Financial Manager &bull; Comprehensive Performance Data &bull; Local &bull; Private
    </div>
</body>
</html>
    `;

    try {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
        console.error('Failed to generate summary PDF:', error);
        throw error;
    }
};
