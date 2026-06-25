import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { initDatabase } from './database';

export const exportToExcel = async (userName: string | null) => {
    try {
        const db = await initDatabase();
        
        // 1. Fetch data from sqlite
        const transactions = await db.getAllAsync(`
            SELECT t.id, t.type, t.amount, t.name, t.description, t.created_at, c.name as category_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            ORDER BY t.created_at DESC
        `);

        // 2. Format data for Excel
        const formattedData = transactions.map((t: any) => ({
            Type: t.type === 'income' ? 'Income' : 'Expense',
            Category: t.category_name || 'System',
            Amount: t.amount,
            Name: t.name,
            Description: t.description || '',
            Date: new Date(t.created_at).toLocaleString(),
        }));

        // 3. Create a new workbook and add the worksheet
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

        // 4. Generate the Excel file in base64
        const excelBase64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

        // 5. Define file path and save
        const timestamp = new Date().toISOString().split('T')[0];
        const formattedName = userName ? userName.replace(/\s+/g, '_') : 'My';
        const fileUri = documentDirectory + `Fraction_Financial_Report_${formattedName}_${timestamp}.xlsx`;
        
        await writeAsStringAsync(fileUri, excelBase64, {
            encoding: EncodingType.Base64
        });

        // 6. Share the file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: 'Export Fraction Data'
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error('Failed to export data to excel:', error);
        return { success: false, error };
    }
};
