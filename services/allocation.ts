import { Category } from './database';

export interface AllocationPreview {
    categoryId: string;
    name: string;
    amount: number;
    percentage: number;
    subAllocations?: AllocationPreview[];
}

export const calculateAllocation = (
    income: number,
    categories: Category[]
): AllocationPreview[] => {
    const mainCategories = categories.filter(c => c.type === 'main' && c.id !== 'system_others');
    const mainTotalUsed = mainCategories.reduce((sum, c) => sum + c.percentage, 0);

    const allocations: AllocationPreview[] = mainCategories.map(main => {
        const mainAmount = (main.percentage / 100) * income;
        const subCategories = categories.filter(c => c.parent_id === main.id);

        let subAllocations: AllocationPreview[] | undefined = undefined;

        if (subCategories.length > 0) {
            const subTotalUsed = subCategories.reduce((sum, c) => sum + c.percentage, 0);
            subAllocations = subCategories.map(sub => ({
                categoryId: sub.id,
                name: sub.name,
                amount: (sub.percentage / 100) * mainAmount,
                percentage: sub.percentage,
            }));

        }

        return {
            categoryId: main.id,
            name: main.name,
            amount: mainAmount,
            percentage: main.percentage,
            subAllocations,
        };
    });



    return allocations;
};

export const validatePercentages = (categories: Category[], parentId: string | null = null): boolean => {
    const group = categories.filter(c => c.parent_id === parentId && c.id !== 'system_others');
    if (group.length === 0) return true;

    const total = group.reduce((sum, c) => sum + c.percentage, 0);
    const isValid = Math.abs(total - 100) < 0.01; // Require exactly 100%

    if (!isValid) return false;

    // Recursively validate subcategories
    return group.every(c => validatePercentages(categories, c.id));
};

export const formatCurrency = (amount: number, currencyCode: string = 'GHS'): string => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
        }).format(amount);
    } catch (e) {
        // Fallback for invalid codes
        return `${currencyCode} ${amount.toFixed(2)}`;
    }
};

export const formatCompact = (amount: number, currencyCode: string = 'GHS'): string => {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (abs < 1_000) return formatCurrency(amount, currencyCode);

    // Extract the currency symbol using Intl so it adapts to any currency
    let symbol = currencyCode;
    try {
        const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).formatToParts(0);
        const currencyPart = parts.find(p => p.type === 'currency');
        if (currencyPart) symbol = currencyPart.value;
    } catch { /* use code as fallback */ }

    if (abs >= 1_000_000_000) return `${sign}${symbol}${(abs / 1_000_000_000).toFixed(1)}b`;
    if (abs >= 1_000_000)     return `${sign}${symbol}${(abs / 1_000_000).toFixed(1)}m`;
    return `${sign}${symbol}${(abs / 1_000).toFixed(1)}k`;
};
