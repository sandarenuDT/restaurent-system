import Modal from "./Modal.jsx";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center space-y-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto
          ${danger ? "bg-red-100" : "bg-brand-100"}`}>
          <span className="text-2xl">{danger ? "⚠️" : "?"}</span>
        </div>
        <div>
          <h3 className="font-display font-bold text-gray-900 text-lg">{title}</h3>
          {message && <p className="text-gray-500 text-sm mt-1">{message}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn btn-outline btn-md flex-1" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`btn btn-md flex-1 ${danger ? "btn-danger" : "btn-primary"}`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}