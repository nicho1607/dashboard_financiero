import { FiTrash2, FiArrowUpCircle, FiArrowDownCircle } from "react-icons/fi";
import { formatMoney } from "../utils/formatMoney";

function TransactionList({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6 text-center transition-colors duration-300">
        <p className="text-gray-400 dark:text-gray-500">No hay transacciones registradas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark p-6 transition-colors duration-300">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Últimas Transacciones
      </h2>
      <ul className="space-y-2">
        {transactions.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-hover-dark transition-colors"
          >
            <div className="flex items-center gap-3">
              {t.type === "income" ? (
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <FiArrowUpCircle className="text-green-500" size={20} />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <FiArrowDownCircle className="text-red-500" size={20} />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {t.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.category} · {t.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-semibold ${
                  t.type === "income" ? "text-green-500" : "text-red-500"
                }`}
              >
                {t.type === "income" ? "+" : "-"}${formatMoney(t.amount)}
              </span>
              <button
                onClick={() => onDelete(t.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Eliminar transacción"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;
