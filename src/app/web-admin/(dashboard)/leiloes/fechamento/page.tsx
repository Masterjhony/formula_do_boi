import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import FechamentoView from '../FechamentoView'

export default function FechamentoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-[#A0792E]" />
        </div>
      }
    >
      <FechamentoView />
    </Suspense>
  )
}
