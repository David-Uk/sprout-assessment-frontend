import type { StatusFilter as Filter } from '../types'
import { STATUS_LABELS } from '../types'

const options: Filter[] = ['all', 'pending', 'in_progress', 'completed']

interface Props {
  value: Filter
  onChange: (value: Filter) => void
  disabled?: boolean
}

export default function StatusFilter({ value, onChange, disabled = false }: Props) {
  return (
    <fieldset className="filter" disabled={disabled}>
      <legend>Filter by status</legend>
      <div className="filter-options">
        {options.map((option) => (
          <label className="filter-option" key={option}>
            <input
              type="radio"
              name="status-filter"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {option === 'all' ? 'All' : STATUS_LABELS[option]}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
