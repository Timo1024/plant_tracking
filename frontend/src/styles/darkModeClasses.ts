// Reusable dark mode class combinations for common UI elements

export const darkModeClasses = {
    // Cards
    card: 'bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50',
    cardHover: 'hover:shadow-lg dark:hover:shadow-gray-900/70',

    // Text
    textPrimary: 'text-gray-900 dark:text-gray-100',
    textSecondary: 'text-gray-600 dark:text-gray-400',
    textMuted: 'text-gray-500 dark:text-gray-500',

    // Inputs
    input: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400',

    // Buttons
    buttonPrimary: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white',
    buttonSecondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
    buttonDanger: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white',

    // Badges
    badgeGreen: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    badgeRed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    badgeBlue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    badgeYellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    badgeGray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',

    // Borders
    border: 'border-gray-200 dark:border-gray-700',
    borderLight: 'border-gray-100 dark:border-gray-800',

    // Backgrounds
    bgPrimary: 'bg-white dark:bg-gray-800',
    bgSecondary: 'bg-gray-50 dark:bg-gray-900',
    bgHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',

    // Links
    link: 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',

    // Dividers
    divider: 'border-gray-200 dark:border-gray-700',

    // Modal/Overlay
    overlay: 'bg-black bg-opacity-50 dark:bg-opacity-70',
    modal: 'bg-white dark:bg-gray-800',
};

// Helper function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
};
