export function AvailabilityNote({
  isAvailable,
  noticeEnabled,
  noticeText,
  unavailableMessage,
}: {
  isAvailable: boolean;
  noticeEnabled: boolean;
  noticeText: string | null;
  unavailableMessage: string;
}) {
  if (!isAvailable) {
    return (
      <p className="text-sm font-semibold text-terracotta">{unavailableMessage}</p>
    );
  }

  if (!noticeEnabled) {
    return null;
  }

  return (
    <p className="text-sm font-semibold text-terracotta">
      {noticeText?.trim() || "Scorte limitate"}
    </p>
  );
}
