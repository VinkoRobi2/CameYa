export default function DashboardFlashEmployer() {
  return (
    <div>
      <UserProfileSummary role="flashemployer" />
      <ProjectsList type="published" />
      {/* ...otros widgets: payment history, etc */}
    </div>
  )
}
