export default function CategoryTabs({ categories, active, onChange, labels }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-1 px-1">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
            ${active === cat
              ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30"
              : "bg-white text-gray-600 border border-gray-200 hover:border-brand-300"
            }`}
        >
          {labels[cat] || cat}
        </button>
      ))}
    </div>
  );
}