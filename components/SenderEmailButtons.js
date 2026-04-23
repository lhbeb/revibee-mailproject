'use client';

export default function SenderEmailButtons({
  accounts,
  selectedEmail,
  onSelect,
  disabled = false,
}) {
  if (!accounts?.length) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Send From
        </label>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          No sender email accounts are configured.
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Send From
      </label>
      <div className="flex flex-wrap gap-3">
        {accounts.map((account) => {
          const isSelected = selectedEmail === account.user;

          return (
            <button
              key={account.user}
              type="button"
              onClick={() => onSelect(account.user)}
              disabled={disabled}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition duration-200 ease-in-out ${
                isSelected
                  ? 'border-[#090A28] bg-[#090A28] text-white shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#F5970C] hover:bg-amber-50'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              {account.user}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-gray-500">Choose which Gmail account will send this email.</p>
    </div>
  );
}
