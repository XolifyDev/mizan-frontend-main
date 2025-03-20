import React, { ReactNode, useState } from 'react'
import { QueryClient } from "@tanstack/react-query";

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <div>Providers</div>
  )
}

export default Providers
