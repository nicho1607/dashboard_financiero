import { FiSun, FiMoon } from "react-icons/fi";

function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg bg-gray-100 dark:bg-card-dark border border-gray-200 dark:border-border-dark hover:bg-gray-200 dark:hover:bg-hover-dark transition-colors"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <FiSun className="text-yellow-400" size={20} />
      ) : (
        <FiMoon className="text-gray-600" size={20} />
      )}
    </button>
  );
}

export default ThemeToggle;
