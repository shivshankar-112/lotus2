import React from 'react'

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="pb-24 max-w-md mx-auto px-4">
        {children}
    </main>
  )
}

export default PageWrapper