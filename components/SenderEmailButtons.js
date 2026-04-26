'use client';

export default function SenderEmailButtons({
  accounts,
  selectedEmail,
  onSelect,
  disabled = false,
}) {
  const groupedAccounts = (accounts || []).reduce((groups, account) => {
    const providerKey = account.provider || 'smtp';
    const providerLabel = providerKey === 'gmail'
      ? 'Gmail SMTP'
      : providerKey === 'brevo'
        ? 'Brevo SMTP'
        : 'SMTP';

    if (!groups[providerKey]) {
      groups[providerKey] = {
        key: providerKey,
        label: providerLabel,
        accounts: [],
      };
    }

    groups[providerKey].accounts.push(account);
    return groups;
  }, {});

  const providerGroups = Object.values(groupedAccounts);

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
      <div className="flex flex-col gap-1 mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Send From
        </label>
        <p className="text-xs text-gray-500">
          {accounts.length} sender accounts across {providerGroups.length} sending methods.
        </p>
      </div>
      <div className="space-y-4">
        {providerGroups.map((group) => (
          <div
            key={group.key}
            className="rounded-xl border border-gray-200 bg-gray-50/70 p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {group.label}
                </p>
                <p className="text-xs text-gray-500">
                  {group.accounts.length} account{group.accounts.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.accounts.map((account) => {
                const isSelected = selectedEmail === account.user;
                const buttonLabel = account.label || account.user;
                const detailLabel = account.fromEmail || account.user;

                return (
                  <button
                    key={account.user}
                    type="button"
                    onClick={() => onSelect(account.user)}
                    disabled={disabled}
                    className={`min-h-[72px] rounded-xl border px-4 py-3 text-left text-sm font-medium transition duration-200 ease-in-out ${
                      isSelected
                        ? 'border-[#090A28] bg-[#090A28] text-white shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-[#F5970C] hover:bg-amber-50'
                    } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <span className="block text-sm font-semibold leading-tight">
                      {buttonLabel}
                    </span>
                    <span className={`mt-1 block text-xs ${
                      isSelected ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {detailLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500">Choose which sender account will send this email.</p>
    </div>
  );
}
