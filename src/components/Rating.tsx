import { StarIcon } from './icons.tsx'

function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <StarIcon className="size-3.5 text-amber-400" />
      {value.toFixed(1)}
    </span>
  )
}

export default Rating
