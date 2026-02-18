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
    const mainCategories = categories.filter(c => c.type === 'main');

    return mainCategories.map(main => {
        const mainAmount = (main.percentage / 100) * income;
        const subCategories = categories.filter(c => c.parent_id === main.id);

        let subAllocations: AllocationPreview[] | undefined = undefined;

        if (subCategories.length > 0) {
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
};

export const validatePercentages = (categories: Category[], parentId: string | null = null): boolean => {
    const group = categories.filter(c => c.parent_id === parentId);
    if (group.length === 0) return true;

    const total = group.reduce((sum, c) => sum + c.percentage, 0);
    // Using a small epsilon for floating point comparison if needed, 
    // but requirements strictly say " exactly 100%"
    const isValid = Math.abs(total - 100) < 0.001;

    if (!isValid) return false;

    // Recursively validate subcategories
    return group.every(c => validatePercentages(categories, c.id));
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};
