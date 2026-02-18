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

            if (subTotalUsed < 100) {
                const subRemainder = 100 - subTotalUsed;
                subAllocations.push({
                    categoryId: 'system_others', // Sub-others also point here for now
                    name: 'Others',
                    amount: (subRemainder / 100) * mainAmount,
                    percentage: subRemainder,
                });
            }
        }

        return {
            categoryId: main.id,
            name: main.name,
            amount: mainAmount,
            percentage: main.percentage,
            subAllocations,
        };
    });

    if (mainTotalUsed < 100) {
        const mainRemainder = 100 - mainTotalUsed;
        allocations.push({
            categoryId: 'system_others',
            name: 'Others',
            amount: (mainRemainder / 100) * income,
            percentage: mainRemainder,
        });
    }

    return allocations;
};

export const validatePercentages = (categories: Category[], parentId: string | null = null): boolean => {
    const group = categories.filter(c => c.parent_id === parentId && c.id !== 'system_others');
    if (group.length === 0) return true;

    const total = group.reduce((sum, c) => sum + c.percentage, 0);
    const isValid = total <= 100.001; // Allow slight float error

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
