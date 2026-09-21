import { MessageSquare, Plus, Trash2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { relativeDay } from "../../utils/dates.js";

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  collapsed = false,
  onToggle,
}) {
  return (
    <div
      className={`flex h-full flex-col transition-[width] duration-200 ${collapsed ? "w-[56px]" : "w-full"
        }`}
    >
      <div
        className={`flex items-center ${collapsed ? "justify-center p-2" : "justify-between p-4"
          }`}
      >
        {!collapsed && (
          <button
            onClick={onNew}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-ink-900 text-sm font-semibold text-white transition hover:bg-ink-800"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New conversation
          </button>
        )}

        <button
          onClick={onToggle}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-400 transition hover:bg-surface hover:text-ink-800"
          aria-label={
            collapsed
              ? "Expand conversation history"
              : "Collapse conversation history"
          }
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          <h2 className="px-5 pb-2 font-sans text-xs font-semibold text-muted">
            History
          </h2>

          <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4 scrollbar-thin">
            {conversations.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted">
                Your conversations will appear here.
              </p>
            )}

            {conversations.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-1 rounded-xl pr-1 transition duration-150 ease-out ${c.id === activeId
                  ? "bg-brand-50 shadow-sm"
                  : "hover:bg-surface hover:translate-x-0.5"
                  }`}
              >
                <button
                  onClick={() => onSelect(c.id)}
                  className="flex min-w-0 flex-1 items-start gap-2.5 px-3 py-2.5 text-left"
                >
                  <MessageSquare
                    className={`mt-0.5 h-4 w-4 shrink-0 ${c.id === activeId
                        ? "text-brand-600"
                        : "text-ink-400"
                      }`}
                    aria-hidden
                  />

                  <span className="min-w-0">
                    <span
                      className={`block truncate text-sm ${c.id === activeId
                          ? "font-semibold text-brand-700"
                          : "font-medium text-ink-800"
                        }`}
                    >
                      {c.title}
                    </span>

                    <span className="text-xs text-muted">
                      {relativeDay(new Date(c.updatedAt).toISOString())}
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${c.title}"? This cannot be undone.`)) {
                      onDelete(c.id);
                    }
                  }}
                  aria-label={`Delete conversation ${c.title}`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-coral-50 hover:text-coral-500 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}