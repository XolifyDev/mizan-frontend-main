export default function Loading() {
  return (
    <div className="space-y-4 p-6 md:p-8">
      <div className="h-20 rounded-3xl border border-[#550C18]/10 bg-white/90" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-32 rounded-3xl border border-[#550C18]/10 bg-white/90" />
        <div className="h-32 rounded-3xl border border-[#550C18]/10 bg-white/90" />
        <div className="h-32 rounded-3xl border border-[#550C18]/10 bg-white/90" />
      </div>
      <div className="h-[420px] rounded-3xl border border-[#550C18]/10 bg-white/90" />
    </div>
  )
}
