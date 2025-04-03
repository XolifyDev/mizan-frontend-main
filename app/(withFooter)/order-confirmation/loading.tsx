export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
        <p className="text-center">Retrieving your order's information...</p>
      </div>
    </div>
  ) 
}

