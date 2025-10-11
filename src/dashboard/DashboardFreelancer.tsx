export default function DashboardFreelancer() {
  return (
    <div>
      <UserProfileSummary role="freelancer" />
      <ProjectsList type="applied" />
      {/* ...otros widgets: earnings, stats, reviews */}
    </div>
  )
}
