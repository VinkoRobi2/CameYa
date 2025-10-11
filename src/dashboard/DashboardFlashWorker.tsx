export default function DashboardFlashworker() {
  return (
    <div>
      <UserProfileSummary role="flashworker" />
      <FlashworkSummary />
      {/* ...otros widgets específicos de flashworker */}
    </div>
  )
}
