import { formatCompact } from '../services/allocation';

export type GuideSituation = 'income' | 'expense' | 'dashboard' | 'setup';

export interface GuideContext {
    balance: number;
    income: number;
    expense: number;
    currencyCode: string;
}

export interface GuideAvatar {
    id: string;
    name: string;
    description: string;
    image: any;
    dialogue: (context: GuideContext) => Record<GuideSituation, string[]>;
}

export const AVATARS: GuideAvatar[] = [
    {
        id: 'owl',
        name: 'Ollie',
        description: 'Wise and observant, always keeping a close eye on your budget.',
        image: require('../assets/images/avatars/owl.png'),
        dialogue: (ctx) => ({
            income: [
                "Hoo-hoo! More seeds for the stash!",
                "A wise addition to your nest egg.",
                `Splendid! Your total balance is now ${formatCompact(ctx.balance, ctx.currencyCode)}.`
            ],
            expense: [
                "Whoo goes there? Ah, just an expense.",
                "Make sure that was a wise choice!",
                `You've spent ${formatCompact(ctx.expense, ctx.currencyCode)} so far. Spend wisely!`
            ],
            dashboard: [
                "Looking sharp today. Let's review the plan.",
                `I've got my eyes wide open. You have ${formatCompact(ctx.balance, ctx.currencyCode)} available.`,
                "A wise bird plans for the winter. Let's see your progress."
            ],
            setup: [
                "Let's build a wise egg nest together.",
                "Planning is the first step to wisdom."
            ]
        })
    },
    {
        id: 'robot',
        name: 'Robo',
        description: 'Precise, logical, and always calculating the best route.',
        image: require('../assets/images/avatars/robot.png'),
        dialogue: (ctx) => ({
            income: [
                "Beep boop! Funds deposited successfully.",
                "Input detected. Wealth algorithms updated.",
                `Processing new income. Current balance: ${formatCompact(ctx.balance, ctx.currencyCode)}.`
            ],
            expense: [
                "Warning: Funds decreasing. Just kidding, it's recorded.",
                "Transaction logged in the mainframe.",
                `Output detected. Total expenses: ${formatCompact(ctx.expense, ctx.currencyCode)}.`
            ],
            dashboard: [
                "All systems nominal. Budget is on track.",
                `Scanning balances... You have ${formatCompact(ctx.balance, ctx.currencyCode)} remaining.`,
                `Hello, human. Income logged: ${formatCompact(ctx.income, ctx.currencyCode)}.`
            ],
            setup: [
                "Initializing financial parameters...",
                "Awaiting input to calibrate your budget."
            ]
        })
    },
    {
        id: 'piggy',
        name: 'Piggy',
        description: 'Cheerful and loves to see your savings get fatter!',
        image: require('../assets/images/avatars/piggy.png'),
        dialogue: (ctx) => ({
            income: [
                "Oink! I'm getting heavier!",
                "Yay! More coins for my belly!",
                `Ka-ching! We're up to ${formatCompact(ctx.balance, ctx.currencyCode)}!`
            ],
            expense: [
                "Ouch! That took a bite out of me.",
                "Make sure you still have enough to feed me later!",
                `We've spent ${formatCompact(ctx.expense, ctx.currencyCode)}. Don't crack me open yet!`
            ],
            dashboard: [
                `Let's see how fat your savings are getting! You have ${formatCompact(ctx.balance, ctx.currencyCode)}.`,
                "I'm hungry for more savings!",
                `You've made ${formatCompact(ctx.income, ctx.currencyCode)}! Keep it coming!`
            ],
            setup: [
                "Let's set up a plan to feed me lots of coins!",
                "Oink! Ready to start saving?"
            ]
        })
    },
    {
        id: 'fox',
        name: 'Foxy',
        description: 'Clever, sharp, and knows all the tricks to keep your money safe.',
        image: require('../assets/images/avatars/fox.png'),
        dialogue: (ctx) => ({
            income: [
                "Clever move! Your stash is growing.",
                "Outsmarted the market again, didn't you?",
                `Fantastic! The stash is now ${formatCompact(ctx.balance, ctx.currencyCode)}.`
            ],
            expense: [
                "A necessary sacrifice for a clever plan, I hope.",
                "Keep it sharp! Don't let them trick you out of your coins.",
                `Tracked it! Your expenses are ${formatCompact(ctx.expense, ctx.currencyCode)}.`
            ],
            dashboard: [
                "Let's review the strategy for today.",
                `Looking clever! You have ${formatCompact(ctx.balance, ctx.currencyCode)} to deploy.`,
                "Your financial den is looking very cozy."
            ],
            setup: [
                "Let's craft a clever plan for your money.",
                "Time to outsmart your expenses!"
            ]
        })
    },
    {
        id: 'turtle',
        name: 'Tim',
        description: 'Slow, steady, and knows that wealth is built over time.',
        image: require('../assets/images/avatars/turtle.png'),
        dialogue: (ctx) => ({
            income: [
                "Slow and steady wins the race. Good job.",
                "Another step forward on our long journey.",
                `Excellent. We have built up to ${formatCompact(ctx.balance, ctx.currencyCode)}.`
            ],
            expense: [
                "Patience... Was that really needed today?",
                "A small step back, but we keep moving forward.",
                `Recorded. We have spent ${formatCompact(ctx.expense, ctx.currencyCode)}. Let's be careful.`
            ],
            dashboard: [
                "Take a deep breath. We are making progress.",
                `Rome wasn't built in a day. You have ${formatCompact(ctx.balance, ctx.currencyCode)} safely stored.`,
                "A calm mind makes the best financial decisions."
            ],
            setup: [
                "Let's take our time and build a strong foundation.",
                "Patience is key. Let's plan our route."
            ]
        })
    }
];

export const getAvatar = (id: string | null): GuideAvatar => {
    return AVATARS.find(a => a.id === id) || AVATARS[0];
};

export const getRandomDialogue = (avatarId: string | null, situation: GuideSituation, context: GuideContext): string => {
    const avatar = getAvatar(avatarId);
    const messages = avatar.dialogue(context)[situation];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
};
